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
 * Recolhida, a marca é só o SÍMBOLO — nos 72px da barra, qualquer versão com
 * texto vira um borrão. Já aconteceu: a barra usava `/logo.png`, que apesar do
 * nome é a marca inteira ("GIRUS SALES CRM SOFTWARE") em proporção quadrada, e
 * ela aparecia espremida em 51px de largura.
 *
 * As três imagens ficam no DOM (quem escolhe é o breakpoint: no drawer do
 * celular a horizontal é a certa), então o que precisa de guarda é qual delas
 * está VISÍVEL.
 */
test("sidebar: recolhida mostra o símbolo, não a marca inteira", async ({
  page,
}) => {
  await mockGraphql(page, {});
  await grantRole(page, "OWNER");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/orders");

  // O símbolo é o `icon-192.png` — `/logo.png`, apesar do nome, é a marca
  // inteira em proporção quadrada, e era ela que aparecia espremida em 51px na
  // barra recolhida. As imagens passam pelo otimizador do Next, então o `src`
  // vem como `/_next/image?url=%2Ficon-192.png...`.
  const logoInteira = nav(page).locator("img[src*='horizontal_logo']");
  const soOSimbolo = nav(page).locator("img[src*='icon-192']");

  await expect(
    page.getByRole("button", { name: "Expandir menu" })
  ).toBeVisible();
  await expect(logoInteira).toBeHidden();
  await expect(soOSimbolo).toBeVisible();

  // Ida e volta pelo clique, que é como o usuário faz.
  await page.getByRole("button", { name: "Expandir menu" }).click();
  await expect(logoInteira).toBeVisible();

  await page.getByRole("button", { name: "Recolher menu" }).click();
  await expect(logoInteira).toBeHidden();
  await expect(soOSimbolo).toBeVisible();
});
