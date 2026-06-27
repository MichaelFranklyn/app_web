import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Cauda longa — vincular um cliente à fábrica
 * (factories/[id]/clients → LinkClientModal). Página SSR (CompanyFactoryDetail
 * via stub fornece o companyFactoryId). 3 selects sem cascata (queries em
 * paralelo); ExistingFactoryClientLinks filtra clientes já vinculados.
 *
 * Mutation LinkClientToFactory → campo de resposta `createSellerClientFactory`.
 */
const base = "/factories/factory-1";
const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

test("fábrica/clientes: vincula um cliente (cliente + vendedor + nível)", async ({
  page,
}) => {
  await mockGraphql(page, {
    FactoryClientLinks: () => ({ factory_client_links: conn([]) }),
    CompanyClientsForFactoryLink: () => ({
      companyClients: {
        edges: [
          {
            node: {
              id: "cc-1",
              isActive: true,
              client: {
                id: "client-1",
                razaoSocial: "Cliente Alvo SA",
                nomeFantasia: "Cliente Alvo",
              },
            },
          },
        ],
      },
    }),
    SellersWithAccessForFactory: () => ({
      sellerFactoryAccessList: {
        edges: [
          {
            node: {
              id: "a-1",
              sellerId: "s-1",
              isActive: true,
              seller: { id: "s-1", name: "Vendedor Acesso" },
            },
          },
        ],
      },
    }),
    PriceTiersForFactoryLink: () => ({
      priceTiers: { edges: [{ node: { id: "t-1", name: "Varejo" } }] },
    }),
    ExistingFactoryClientLinks: () => ({
      sellerClientFactoryList: { edges: [] },
    }),
    LinkClientToFactory: () => ({
      createSellerClientFactory: {
        status: true,
        message: "ok",
        data: { id: "link-1" },
      },
    }),
  });

  await page.goto(`${base}/clients`);
  await page.getByRole("button", { name: "Vincular cliente" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const cliente = dialog.getByRole("textbox", { name: "Cliente" });
  await cliente.click();
  await cliente.pressSequentially("Cliente Alvo");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Cliente Alvo", { exact: true })
    .click();

  const vendedor = dialog.getByRole("textbox", { name: "Vendedor" });
  await vendedor.click();
  await vendedor.pressSequentially("Vendedor Acesso");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Vendedor Acesso", { exact: true })
    .click();

  const nivel = dialog.getByRole("textbox", {
    name: "Nível da tabela de preço",
  });
  await nivel.click();
  await nivel.pressSequentially("Varejo");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Varejo", { exact: true })
    .click();

  await dialog.getByRole("button", { name: "Vincular cliente" }).click();

  await expect(page.getByText("Cliente vinculado com sucesso")).toBeVisible();
});

test("fábrica/clientes: edita o vínculo (nível/prioridade)", async ({
  page,
}) => {
  const link = {
    id: "link-1",
    priority: "high",
    priceTierId: "t-1",
    client: {
      id: "client-1",
      razaoSocial: "Cliente Vinculado SA",
      nomeFantasia: "Cliente Vinculado",
    },
    seller: { id: "s-1", name: "Vendedor" },
    priceTier: { id: "t-1", name: "Varejo" },
  };
  await mockGraphql(page, {
    FactoryClientLinks: () => ({ factory_client_links: conn([link]) }),
    PriceTiersForFactoryLink: () => ({
      priceTiers: { edges: [{ node: { id: "t-1", name: "Varejo" } }] },
    }),
    UpdateFactoryClientLink: () => ({
      updateSellerClientFactory: {
        status: true,
        message: "ok",
        data: { id: "link-1" },
      },
    }),
  });

  await page.goto(`${base}/clients`);
  await page
    .getByRole("row", { name: /Cliente Vinculado/ })
    .getByRole("button", { name: "Editar" })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Editar vínculo")).toBeVisible();
  // nível pré-preenchido do nó; mudamos só a prioridade.
  // GOTCHA: select prefilled traz o label atual ("Alta") no input — é preciso
  // LIMPAR antes de digitar, senão pressSequentially concatena ("AltaMédia").
  const prioridade = dialog.getByRole("textbox", { name: "Prioridade" });
  await prioridade.click();
  await prioridade.press("ControlOrMeta+a");
  await prioridade.press("Delete");
  await prioridade.pressSequentially("Média");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Média", { exact: true })
    .click();

  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Vínculo atualizado com sucesso")).toBeVisible();
});
