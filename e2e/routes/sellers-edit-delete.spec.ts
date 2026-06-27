import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Fluxos de ESCRITA em /sellers (aba "Lista de Vendedores"): editar, excluir e
 * toggle ativar/desativar — mesmo molde de users-edit-delete (MoreOptions →
 * menuitem → modal). sellersStats roda SSR e é atendida pelo stub GraphQL.
 * A aba "Acessos por Fábrica" também monta, então mockamos SellerFactoryAccessList.
 */
const seedSeller = (over: Record<string, unknown> = {}) => ({
  id: "s-1",
  name: "João Antigo",
  phone: "11999990000",
  region: "Sudeste",
  isActive: true,
  factoryCount: 0,
  clientCount: 0,
  totalRevenue: "0",
  lastOrderDate: null,
  // Endereço: o UpdateSellerModal prefill esses campos (required) a partir do
  // nó da linha; sem eles a validação do form barra o submit do edit.
  homeCep: "01310-100",
  homeState: "SP",
  homeCity: "São Paulo",
  homeNeighborhood: "Bela Vista",
  homeStreet: "Av. Paulista",
  homeNumber: "1000",
  homeComplement: "",
  ...over,
});

const sellersListMock = (sellers: Array<Record<string, unknown>>) => ({
  Sellers: () => ({
    sellers_list: {
      edges: sellers.map((node) => ({ node })),
      pageInfo: { hasNextPage: false, endCursor: null },
      totalCount: sellers.length,
    },
  }),
  SellerFactoryAccessList: () => ({
    seller_factory_access_list: emptyConnection(),
  }),
});

test("sellers: edita o nome e a linha reflete a mudança", async ({ page }) => {
  const sellers = [seedSeller()];

  await mockGraphql(page, {
    ...sellersListMock(sellers),
    UpdateSeller: (variables) => {
      const input = (variables.input ?? {}) as { name?: string };
      const s = sellers.find((x) => x.id === variables.id);
      if (s && input.name) s.name = input.name;
      return {
        updateSeller: {
          status: true,
          message: "ok",
          data: { id: variables.id, ...input, isActive: true },
        },
      };
    },
  });

  await page.goto("/sellers");

  const row = page.getByRole("row", { name: /João Antigo/ });
  await row.getByRole("button").click();
  await page.getByRole("menuitem", { name: "Editar" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("João Novo");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Vendedor atualizado com sucesso")).toBeVisible();
  await expect(page.getByText("João Novo")).toBeVisible();
});

test("sellers: desativa um vendedor e o badge vira Inativo", async ({
  page,
}) => {
  const sellers = [seedSeller({ name: "Carlos Ativo" })];

  await mockGraphql(page, {
    ...sellersListMock(sellers),
    ToggleSeller: () => ({ updateSeller: { status: true, message: "ok" } }),
  });

  await page.goto("/sellers");

  const row = page.getByRole("row", { name: /Carlos Ativo/ });
  await row.getByRole("button").click();
  await page.getByRole("menuitem", { name: "Desativar" }).click();

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Desativar" })
    .click();

  await expect(page.getByText("Vendedor desativado com sucesso")).toBeVisible();
  await expect(row.getByText("Inativo")).toBeVisible();
});

test("sellers: exclui um vendedor e a linha some", async ({ page }) => {
  const sellers = [seedSeller({ name: "Pedro Excluir" })];

  await mockGraphql(page, {
    ...sellersListMock(sellers),
    DeleteSeller: (variables) => {
      const idx = sellers.findIndex((s) => s.id === variables.id);
      if (idx >= 0) sellers.splice(idx, 1);
      return { deleteSeller: { status: true, message: "ok" } };
    },
  });

  await page.goto("/sellers");

  const row = page.getByRole("row", { name: /Pedro Excluir/ });
  await row.getByRole("button").click();
  await page.getByRole("menuitem", { name: "Excluir" }).click();

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Excluir vendedor" })
    .click();

  await expect(page.getByText("Vendedor excluído com sucesso")).toBeVisible();
  await expect(page.getByText("Pedro Excluir")).toHaveCount(0);
});
