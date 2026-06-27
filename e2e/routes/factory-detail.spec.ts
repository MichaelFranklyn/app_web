import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Lote 3 — detalhe da fábrica (factories/[id]/overview). A página é SSR: a query
 * `CompanyFactoryDetail` é atendida pelo stub GraphQL (ver stub-backend.ts).
 * Edit/Delete ficam no header (FactoryPageHeader); a OverviewTab não dispara
 * queries client-side. Edit = condições comerciais; Delete = desvincula e navega.
 */
const URL = "/factories/factory-1/overview";

test("fábrica detalhe: edita as condições comerciais", async ({ page }) => {
  await mockGraphql(page, {
    UpdateCompanyFactory: (v) => ({
      updateCompanyFactory: {
        status: true,
        message: "ok",
        data: { id: "cf-1", ...(v.input as object) },
      },
    }),
  });

  await page.goto(URL);

  await page.getByRole("button", { name: "Editar" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Editar condições comerciais")).toBeVisible();

  // Muda um campo de texto (evita o select custom) para gerar diff e submeter.
  await dialog.locator('input[name="territory"]').fill("Nacional");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Fábrica atualizada com sucesso")).toBeVisible();
});

test("fábrica detalhe: desvincula a fábrica", async ({ page }) => {
  await mockGraphql(page, {
    CompanyFactories: () => ({ company_factories_list: emptyConnection() }),
    DeleteCompanyFactory: () => ({
      deleteCompanyFactory: { status: true, message: "ok" },
    }),
  });

  await page.goto(URL);

  await page.getByRole("button", { name: "Excluir" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Excluir vínculo" })
    .click();

  await expect(page).toHaveURL(/\/factories$/);
});
