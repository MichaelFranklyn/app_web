import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

test("settings: redireciona para o catálogo e renderiza as seções", async ({
  page,
}) => {
  await mockGraphql(page, {
    SettingsProductCategories: () => ({
      product_categories: emptyConnection(),
    }),
    SettingsProductUnits: () => ({ productUnits: emptyConnection() }),
    SettingsProductUnitLabels: () => ({ productUnitLabels: emptyConnection() }),
    SettingsTaxRules: () => ({ taxRules: emptyConnection() }),
  });

  await page.goto("/settings");

  // /settings faz redirect server-side para /settings/catalog.
  await expect(page).toHaveURL(/\/settings\/catalog$/);
  await expect(page.getByText("Categorias de produtos").first()).toBeVisible();
});

test("settings/routine: renderiza a aba de configuração de rotina", async ({
  page,
}) => {
  await mockGraphql(page, {
    VisitScheduleConfigs: () => ({ schedule_configs: emptyConnection() }),
  });

  await page.goto("/settings/routine");

  await expect(page).toHaveURL(/\/settings\/routine$/);
  await expect(page.getByText("Configuração de rotina").first()).toBeVisible();
});
