import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

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

  // Catálogos da empresa é aba de gestor (vendedor só vê a rotina).
  await grantRole(page, "OWNER");
  await page.goto("/settings");

  // /settings faz redirect server-side para /settings/catalog (papel gestor).
  await expect(page).toHaveURL(/\/settings\/catalog$/);
  await expect(page.getByText("Catálogos da empresa").first()).toBeVisible();
  await expect(page.getByText("Categorias de produtos").first()).toBeVisible();
});

test("settings: vendedor cai na rotina e não vê a aba de catálogos", async ({
  page,
}) => {
  await mockGraphql(page, {
    VisitScheduleConfigs: () => ({ schedule_configs: emptyConnection() }),
  });

  // Estado padrão do storageState já é SELLER, mas o redirect de /settings usa
  // o papel do JWT (owner no FAKE_JWT) — forjamos um token de vendedor.
  await grantRole(page, "SELLER", { alsoJwt: true });
  await page.goto("/settings");

  await expect(page).toHaveURL(/\/settings\/routine$/);
  await expect(page.getByText("Catálogos da empresa")).toHaveCount(0);
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
