import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Configurações é UM item na sidebar. As telas (Empresa, Plano, Pessoas,
 * Catálogos, Trazer dados) ficam no menu interno da área, que só mostra o que
 * o papel pode abrir — item que leva a um redirect é pior do que item ausente.
 */
const sidebar = (page: import("@playwright/test").Page) =>
  page.locator("aside").first();

const settingsNav = (page: import("@playwright/test").Page) =>
  page.getByRole("navigation", { name: "Configurações" });

test("sidebar: configurações é um item só e abre o menu da área", async ({
  page,
}) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.goto("/orders");

  const side = sidebar(page);
  await expect(side.getByRole("link", { name: "Pessoas" })).toHaveCount(0);
  await expect(side.getByRole("link", { name: "Catálogos" })).toHaveCount(0);
  await side.getByRole("link", { name: "Configurações" }).click();

  // O dono cai na primeira tela que ele abre: Empresa.
  await expect(page).toHaveURL(/\/settings\/company$/);
  const nav = settingsNav(page);
  for (const name of [
    "Empresa",
    "Plano",
    "Pessoas",
    "Catálogos",
    "Trazer dados",
  ]) {
    await expect(nav.getByRole("link", { name })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: "Empresa" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

test("configurações: o admin não vê o que é do dono", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "ADMIN");
  // Direto na tela: o redirect de `/settings` lê o papel do TOKEN, e o
  // `grantRole` do E2E troca só o cookie do usuário (que o menu lê).
  await page.goto("/settings/users");

  // `updateCompany` é @is_owner: Empresa levaria a um redirect.
  const nav = settingsNav(page);
  await expect(nav.getByRole("link", { name: "Pessoas" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Empresa" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Plano" })).toHaveCount(0);
});

test("sidebar: o vendedor não vê configurações", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "SELLER");
  await page.goto("/orders");

  const side = sidebar(page);
  await expect(side.getByRole("link", { name: "Configurações" })).toHaveCount(
    0
  );
  // O que é dele continua alcançável — o próprio perfil está no menu da topbar.
  await expect(side.getByRole("link", { name: "Pedidos" })).toBeVisible();
});

test("configurações: o menu da área leva aos catálogos", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.goto("/settings/company");

  await settingsNav(page).getByRole("link", { name: "Catálogos" }).click();

  await expect(page).toHaveURL(/\/settings\/catalog$/);
  await expect(
    page.getByRole("heading", { name: "Catálogos da empresa" })
  ).toBeVisible();
  await expect(
    settingsNav(page).getByRole("link", { name: "Catálogos" })
  ).toHaveAttribute("aria-current", "page");
});
