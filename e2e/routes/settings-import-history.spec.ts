import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Migração da Mercos: o histórico de pedidos. A planilha exportada vem com os
 * títulos dela; o assistente adivinha as colunas, casa fábrica e vendedor pelo
 * nome, mostra a prévia (nada gravado) e só então importa.
 */
const connection = <T>(nodes: T[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

const result = (dryRun: boolean) => ({
  importOrderHistory: {
    status: true,
    message: "ok",
    data: {
      dryRun,
      totalRows: 3,
      ordersCreated: 2,
      ordersAlreadyImported: 0,
      ordersSkipped: 1,
      itemsImported: 2,
      itemsSkipped: 1,
      linksCreated: 1,
      issues: [],
      missingProducts: [],
      missingClients: [{ document: "11111111000111", rows: 1 }],
    },
  },
});

const CSV = [
  "Número do pedido,Data de emissão,CNPJ,Representada,Vendedor,Código,Produto,Qtde,Total",
  "1001,04/05/2026,12.345.678/0001-90,HERC PLASTICOS,Orlando,134,Torneira,12,126",
  "1002,03/06/2026,12.345.678/0001-90,HERC PLASTICOS,Orlando,134,Torneira,12,126",
  "1003,02/07/2026,11.111.111/0001-11,HERC PLASTICOS,Orlando,134,Torneira,1,10",
].join("\n");

test("migração: histórico da Mercos passa pela prévia antes de gravar", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    HistoryImportFactories: () => ({
      companyFactories: connection([
        {
          id: "cf-1",
          factoryId: "f-1",
          nickname: "Herc",
          factory: {
            id: "f-1",
            nomeFantasia: "Herc",
            razaoSocial: "Herc LTDA",
          },
        },
      ]),
    }),
    HistoryImportSellers: () => ({
      sellers: connection([{ id: "s-1", name: "Orlando" }]),
    }),
    ImportOrderHistory: (variables) =>
      result(Boolean((variables.input as { dryRun: boolean }).dryRun)),
  });

  await page.goto("/settings/import/orders");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pedidos.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(CSV),
  });
  await expect(
    page.getByText("Encontramos 3 linha(s) de itens.")
  ).toBeVisible();

  const next = page.getByRole("button", { name: "Próximo" });
  await next.click();
  // Colunas adivinhadas pelos títulos da Mercos: nada faltando.
  await expect(page.getByText("Falta escolher a coluna")).toHaveCount(0);
  await next.click();

  // "HERC PLASTICOS" casou com "Herc" sozinho; sem pendências.
  await expect(page.getByText("sem correspondente")).toHaveCount(0);
  await page.getByRole("button", { name: "Conferir" }).last().click();

  await expect(page.getByText("Confira antes de importar")).toBeVisible();
  await expect(page.getByText("1 cliente(s) fora da carteira")).toBeVisible();
  const preview = spy.lastVariables("ImportOrderHistory");
  const input = preview?.input as {
    dryRun: boolean;
    rows: { factoryId: string; sellerId: string; orderDate: string }[];
  };
  expect(input.dryRun).toBe(true);
  expect(input.rows[0]).toMatchObject({
    factoryId: "f-1",
    sellerId: "s-1",
    orderDate: "2026-05-04",
  });

  await page.getByRole("button", { name: "Importar 2 pedido(s)" }).click();
  await expect(
    page.getByText("Histórico importado", { exact: true })
  ).toBeVisible();
  expect(
    (spy.lastVariables("ImportOrderHistory")?.input as { dryRun: boolean })
      .dryRun
  ).toBe(false);
});
