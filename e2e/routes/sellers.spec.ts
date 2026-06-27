import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

// sellersStats roda SERVER-SIDE (page.tsx) e é atendida pelo stub GraphQL;
// aqui mockamos as queries client-side das duas abas.
test("sellers: a página carrega com as abas de vendedores", async ({
  page,
}) => {
  await mockGraphql(page, {
    Sellers: () => ({ sellers_list: emptyConnection() }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
  });

  await page.goto("/sellers");

  await expect(page.getByText(/Lista de Vendedores/).first()).toBeVisible();
});
