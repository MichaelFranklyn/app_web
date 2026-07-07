import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Fluxo de ESCRITA: importar clientes via planilha (ImportClientsModal).
 * Sobe um CSV (CNPJ + Observações); o backend é mockado por operationName
 * (ImportCompanyClients) devolvendo o resumo. Asserção fiel: resumo com as
 * contagens no modal + toast de conclusão. ClientStats (SSR) vem do stub GraphQL.
 */
test("clients: importa clientes via planilha e mostra o resumo", async ({
  page,
}) => {
  await mockGraphql(page, {
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
