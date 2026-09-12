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

/**
 * Recolhida, a marca é só o ÍCONE — a logo horizontal não cabe nos 72px e
 * vazaria por cima do conteúdo. As duas imagens ficam no DOM (quem escolhe é o
 * breakpoint: no drawer do celular a completa é a certa), então o que precisa de
 * guarda é qual delas está VISÍVEL.
 */
test("sidebar: recolhida mostra o ícone, não a logo inteira", async ({
  page,
}) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/orders");

  // As imagens passam pelo otimizador do Next, então o `src` é
  // `/_next/image?url=%2Flogo.png...` — daí o `%2F` no seletor do ícone, que
  // também o separa de `horizontal_logo.png`.
  const logoInteira = nav(page).locator("img[src*='horizontal_logo']");
  const soOIcone = nav(page).locator("img[src*='%2Flogo.png']");

  await expect(
    page.getByRole("button", { name: "Expandir menu" })
  ).toBeVisible();
  await expect(logoInteira).toBeHidden();
  await expect(soOIcone).toBeVisible();

  // Ida e volta pelo clique, que é como o usuário faz.
  await page.getByRole("button", { name: "Expandir menu" }).click();
  await expect(logoInteira).toBeVisible();

  await page.getByRole("button", { name: "Recolher menu" }).click();
  await expect(logoInteira).toBeHidden();
  await expect(soOIcone).toBeVisible();
});
