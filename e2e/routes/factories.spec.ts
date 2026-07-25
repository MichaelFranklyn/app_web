import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

test("factories: lista vazia carrega e renderiza o cabeçalho", async ({
  page,
}) => {
  await mockGraphql(page, {
    CompanyFactories: () => ({ company_factories_list: emptyConnection() }),
  });

  await page.goto("/factories");

  await expect(
    page.getByRole("heading", { name: "Fábricas Representadas", level: 1 })
  ).toBeVisible();
});
