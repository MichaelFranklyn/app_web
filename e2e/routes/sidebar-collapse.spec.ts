import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * O menu lateral entra RECOLHIDO (só ícones) e lembra a escolha de quem o
 * expandir. E "Relatórios" saiu dele: a área continua existindo, alcançada pelo
 * botão no cabeçalho do dashboard.
 */
const nav = (page: import("@playwright/test").Page) =>
  page.locator("aside").first();

test("sidebar: entra recolhida, sem rótulos escritos", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.goto("/orders");

  // Recolhida, o botão da borda oferece EXPANDIR — é o estado inicial.
  await expect(
    page.getByRole("button", { name: "Expandir menu" })
  ).toBeVisible();
  // O destino continua alcançável (o rótulo vira o `title` do ícone), mas o
  // texto não é desenhado.
  await expect(nav(page).getByText("Pedidos", { exact: true })).toBeHidden();
});

test("sidebar: expandir sobrevive à navegação", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.goto("/orders");

  await page.getByRole("button", { name: "Expandir menu" }).click();
  await expect(nav(page).getByText("Pedidos", { exact: true })).toBeVisible();

  // A escolha é persistida: trocar de página não devolve o menu ao padrão.
  await page.goto("/clients");
  await expect(nav(page).getByText("Pedidos", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Recolher menu" })
  ).toBeVisible();
});

test("sidebar: Relatórios não é mais um item do menu", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.goto("/orders");
  await page.getByRole("button", { name: "Expandir menu" }).click();

  await expect(nav(page).getByRole("link", { name: "Relatórios" })).toHaveCount(
    0
  );
  // A rota continua de pé — o menu é que não a carrega mais.
  await page.goto("/dashboard/reports/sales");
  await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
});
