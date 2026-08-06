import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * A configuração deixou de ser um item único levando ao hub: Empresa, Pessoas e
 * Catálogos são destinos na sidebar. Cada um só aparece para quem pode abri-lo —
 * item que leva a um redirect é pior do que item ausente.
 */
const nav = (page: import("@playwright/test").Page) =>
  page.locator("aside").first();

/**
 * A sidebar entra recolhida (só ícones), e recolhida o TÍTULO da seção some —
 * fica só o ícone de cada destino. Quem quer conferir o rótulo escrito precisa
 * expandir primeiro; os links seguem alcançáveis pelo nome nos dois estados,
 * porque recolhido o rótulo vira o `title` do ícone.
 */
const expandSidebar = async (page: import("@playwright/test").Page) => {
  await page.getByRole("button", { name: "Expandir menu" }).click();
};

test("sidebar: o dono vê os três destinos de configuração", async ({
  page,
}) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.goto("/orders");
  await expandSidebar(page);

  const sidebar = nav(page);
  await expect(sidebar.getByText("Configurações")).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Empresa" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Pessoas" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Catálogos" })).toBeVisible();
});

test("sidebar: Empresa não aparece para o admin", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "ADMIN");
  await page.goto("/orders");

  const sidebar = nav(page);
  // `updateCompany` é @is_owner: o item levaria a um redirect.
  await expect(sidebar.getByRole("link", { name: "Empresa" })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Pessoas" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Catálogos" })).toBeVisible();
});

test("sidebar: o vendedor não vê a seção de configuração", async ({ page }) => {
  await mockGraphql(page, {});
  await grantRole(page, "SELLER");
  await page.goto("/orders");

  const sidebar = nav(page);
  await expect(sidebar.getByText("Configurações")).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Pessoas" })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Catálogos" })).toHaveCount(0);
  // O que é dele continua alcançável — o próprio perfil está no menu da topbar.
  await expect(sidebar.getByRole("link", { name: "Pedidos" })).toBeVisible();
});

test("sidebar: Catálogos leva direto ao índice de catálogos", async ({
  page,
}) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.goto("/orders");

  await nav(page).getByRole("link", { name: "Catálogos" }).click();

  await expect(page).toHaveURL(/\/settings\/catalog$/);
  await expect(
    page.getByRole("heading", { name: "Catálogos da empresa" })
  ).toBeVisible();
});
