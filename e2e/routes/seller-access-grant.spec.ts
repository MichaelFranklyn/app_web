import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Cauda longa — conceder acesso de vendedor a uma fábrica
 * (/sellers → aba "Acessos por Fábrica" → AddAccessModal).
 *
 * Select-create com CASCATA: escolher o vendedor habilita/filtra as fábricas
 * (oculta as já vinculadas àquele vendedor).
 *
 * GOTCHA (o motivo do fracasso anterior): as 3 queries de opção usam ALIAS
 * de campo no GraphQL — o mock deve devolver os dados sob a CHAVE DO ALIAS,
 * não sob o nome cru do campo:
 *   - SellersOptions          → sellers_options: sellers
 *   - CompanyFactoriesOptions → company_factories_options: companyFactories
 *   - SellerAccessesForModal  → seller_accesses: sellerFactoryAccessList
 */
test("vendedor/acessos: concede acesso a uma fábrica (cascata)", async ({
  page,
}) => {
  await mockGraphql(page, {
    // Conteúdo das duas abas é montado junto (Tabs Radix renderiza ambos).
    Sellers: () => ({ sellers_list: emptyConnection() }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
    // Opções do modal (skip: !open) — DEVOLVER SOB O ALIAS.
    SellersOptions: () => ({
      sellers_options: {
        edges: [
          {
            node: { id: "seller-1", name: "Vendedor Cascata", isActive: true },
          },
        ],
      },
    }),
    CompanyFactoriesOptions: () => ({
      company_factories_options: {
        edges: [
          {
            node: {
              factoryId: "factory-1",
              factory: {
                id: "factory-1",
                nomeFantasia: "Fábrica Disponível",
                razaoSocial: "Fábrica Disponível LTDA",
              },
            },
          },
        ],
      },
    }),
    SellerAccessesForModal: () => ({ seller_accesses: { edges: [] } }),
    CreateSellerFactoryAccess: () => ({
      createSellerFactoryAccess: { status: true, message: "ok" },
    }),
  });

  await page.goto("/sellers");
  await page.getByRole("tab", { name: "Acessos por Fábrica" }).click();
  await page.getByRole("button", { name: "Novo Vínculo" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // 1º o vendedor (reseta o campo de fábrica e libera as opções de fábrica).
  const vendedor = dialog.getByRole("textbox", { name: "Vendedor" });
  await vendedor.click();
  await vendedor.pressSequentially("Vendedor Cascata");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Vendedor Cascata", { exact: true })
    .click();

  // 2º a fábrica (só aparece após escolher o vendedor).
  const fabrica = dialog.getByRole("textbox", { name: "Fábrica" });
  await fabrica.click();
  await fabrica.pressSequentially("Fábrica Disponível");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Fábrica Disponível", { exact: true })
    .click();

  await dialog.getByRole("button", { name: "Criar vínculo" }).click();

  await expect(page.getByText("Vínculo criado com sucesso")).toBeVisible();
});

test("vendedor/acessos: revoga um acesso existente", async ({ page }) => {
  const access = {
    id: "acc-1",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    seller: { id: "seller-1", name: "Vendedor Ativo", isActive: true },
    factory: {
      id: "factory-1",
      nomeFantasia: "Fábrica Vinculada",
      razaoSocial: "Fábrica Vinculada LTDA",
    },
    grantedByUser: { id: "u-1", name: "Admin" },
  };
  await mockGraphql(page, {
    Sellers: () => ({ sellers_list: emptyConnection() }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: {
        edges: [{ node: access }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    RevokeSellerFactoryAccess: () => ({
      updateSellerFactoryAccess: { status: true, message: "ok" },
    }),
  });

  await page.goto("/sellers");
  await page.getByRole("tab", { name: "Acessos por Fábrica" }).click();
  await page
    .getByRole("row", { name: /Vendedor Ativo/ })
    .getByRole("button")
    .last()
    .click();
  await page.getByRole("menuitem", { name: "Revogar acesso" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Revogar acesso" })
    .click();

  await expect(page.getByText("Acesso revogado com sucesso")).toBeVisible();
});
