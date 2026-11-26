import type { Page } from "@playwright/test";
import * as XLSX from "xlsx";

import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA: importar clientes via planilha (ImportClientsModal).
 * O backend é mockado por operationName (ImportCompanyClients) devolvendo o
 * resumo. Asserção fiel: resumo com as contagens no modal + toast de conclusão.
 * ClientStats (SSR) vem do stub GraphQL.
 *
 * Dois formatos, um por teste: .xlsx é o da planilha modelo (e o que a leitura
 * faz via SheetJS, carregado sob demanda no browser); .csv segue aceito porque
 * há quem exporte assim do sistema antigo.
 */
const mockImport = (page: Parameters<typeof mockGraphql>[0]) =>
  mockGraphql(page, {
    Clients: () => ({ clients_list: emptyConnection() }),
    CompanyClientsImportSheet: () => ({
      companyClientsImportSheet: {
        status: true,
        message: "OK",
        data: {
          rows: [
            {
              cnpj: "11222333000181",
              notes: "Paga em dia",
              sellerEmail: "ana@exemplo.com",
              factoryName: "Herc",
              factoryClientCode: "00123",
            },
            {
              cnpj: "11222333000181",
              notes: "Paga em dia",
              sellerEmail: "ana@exemplo.com",
              factoryName: "Sol",
              factoryClientCode: null,
            },
          ],
          sellerEmails: ["ana@exemplo.com"],
          factoryNames: ["Herc", "Sol"],
        },
      },
    }),
    ImportCompanyClients: (variables) => {
      const rows = ((variables.input as { rows?: unknown[] })?.rows ??
        []) as unknown[];
      return {
        importCompanyClients: {
          status: true,
          message: `Importação concluída: ${rows.length} adicionado(s), 0 ignorado(s), 0 com erro.`,
          data: {
            total: rows.length,
            created: rows.length,
            linksCreated: 0,
            codesSaved: 0,
            skipped: 0,
            failed: 0,
            errors: [],
            ignored: [],
          },
        },
      };
    },
  });

/**
 * Importar mora no menu "Mais ações" do cabeçalho, com Redes e Higienizar:
 * eram cinco botões à vista e no celular a lista só começava na segunda tela.
 */
const openImport = async (page: Page) => {
  await page.getByRole("button", { name: "Mais ações da carteira" }).click();
  await page.getByRole("menuitem", { name: "Importar planilha" }).click();
};

test("clients: baixa a planilha com a carteira, uma linha por fábrica", async ({
  page,
}) => {
  await mockImport(page);

  await page.goto("/clients");
  await openImport(page);

  const dialog = page.getByRole("dialog");
  // O modal abre logo depois do menu fechar: clicar antes de ele assentar
  // perde o clique.
  await expect(
    dialog.getByText("Vendedor e fábrica", { exact: true })
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Baixar planilha" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("carteira-de-clientes.xlsx");

  // Abre o arquivo baixado: tem de ser um xlsx legível, com as colunas que o
  // parser lê e a carteira da empresa, o CNPJ repetido por fábrica.
  const path = await download.path();
  const workbook = XLSX.readFile(path);
  const rows = XLSX.utils.sheet_to_json<string[]>(
    workbook.Sheets[workbook.SheetNames[0]],
    // Como a importação lê (`blankrows: false`): as linhas vazias que só têm
    // a lista suspensa não contam.
    { header: 1, raw: false, blankrows: false }
  );

  expect(rows[0]).toEqual([
    "CNPJ",
    "Observações",
    "Email do vendedor",
    "Fábrica",
    "Código do cliente na fábrica",
  ]);
  // O código sai como texto, com o zero à esquerda; sem código, a célula vem
  // vazia.
  expect(rows.slice(1)).toEqual([
    ["11.222.333/0001-81", "Paga em dia", "ana@exemplo.com", "Herc", "00123"],
    ["11.222.333/0001-81", "Paga em dia", "ana@exemplo.com", "Sol", ""],
  ]);
});

test("clients: importa clientes via planilha .xlsx e mostra o resumo", async ({
  page,
}) => {
  await mockImport(page);

  await page.goto("/clients");
  await openImport(page);

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Importar clientes")).toBeVisible();

  // Mesma forma da planilha modelo: cabeçalho + 2 linhas.
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["CNPJ", "Observações"],
    ["11.222.333/0001-81", "Teste"],
    ["00.000.000/0001-91", ""],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

  await dialog.locator('input[type="file"]').setInputFiles({
    name: "clientes.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
  });

  await dialog.getByRole("button", { name: "Importar", exact: true }).click();

  await expect(
    page.getByText("Importação concluída", { exact: true })
  ).toBeVisible();
  await expect(dialog.getByText("Adicionados")).toBeVisible();
  await expect(dialog.getByText("2", { exact: true })).toBeVisible();
});

test("clients: importa clientes via planilha e mostra o resumo", async ({
  page,
}) => {
  await mockImport(page);

  await page.goto("/clients");
  await openImport(page);

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Importar clientes")).toBeVisible();

  await dialog.locator('input[type="file"]').setInputFiles({
    name: "clientes.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "CNPJ,Observações\n11.222.333/0001-81,Teste\n00.000.000/0001-91,\n"
    ),
  });

  await dialog.getByRole("button", { name: "Importar", exact: true }).click();

  // Título do toast (a descrição repete o texto, por isso exact no título).
  await expect(
    page.getByText("Importação concluída", { exact: true })
  ).toBeVisible();
  // Passo de resumo: card "Adicionados" com a contagem das 2 linhas do CSV.
  await expect(dialog.getByText("Adicionados")).toBeVisible();
  await expect(dialog.getByText("2", { exact: true })).toBeVisible();
});
