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
            skipped: 0,
            failed: 0,
            errors: [],
            ignored: [],
          },
        },
      };
    },
  });

test("clients: baixa a planilha modelo em .xlsx com as colunas da mutation", async ({
  page,
}) => {
  await mockImport(page);

  await page.goto("/clients");
  await page.getByRole("button", { name: "Importar" }).click();

  const dialog = page.getByRole("dialog");
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Baixar modelo" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("modelo-importacao-clientes.xlsx");

  // Abre o arquivo baixado: tem de ser um xlsx legível, com as colunas que o
  // parser lê por posição (CNPJ, Observações) e o exemplo preenchido.
  const path = await download.path();
  const workbook = XLSX.readFile(path);
  const rows = XLSX.utils.sheet_to_json<string[]>(
    workbook.Sheets[workbook.SheetNames[0]],
    { header: 1, raw: false }
  );

  expect(rows[0]).toEqual(["CNPJ", "Observações"]);
  expect(rows[1][0]).toBe("00.000.000/0001-91");
});

test("clients: importa clientes via planilha .xlsx e mostra o resumo", async ({
  page,
}) => {
  await mockImport(page);

  await page.goto("/clients");
  await page.getByRole("button", { name: "Importar" }).click();

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
  await page.getByRole("button", { name: "Importar" }).click();

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
