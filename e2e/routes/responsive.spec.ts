import { expect, test } from "../support/fixtures";
import {
  emptyConnection,
  emptyDashboardQueries,
  mockGraphql,
} from "../support/graphql";

/**
 * Guarda de responsividade. Verifica, no viewport mobile, que:
 *  - o shell vira drawer (hambúrguer abre/fecha o menu lateral);
 *  - nenhuma tela principal tem overflow horizontal de página;
 * e, no desktop, que a sidebar fica fixa (sem hambúrguer).
 *
 * Os mocks usam os shapes reais de cada query para as páginas montarem de fato
 * (uma página em estado de erro passaria trivialmente no teste de overflow).
 */

const conn = emptyConnection;

const MOBILE = { width: 360, height: 740 };
const DESKTOP = { width: 1280, height: 800 };
// O auto-start do tour é suprimido globalmente em support/fixtures.ts.

// Handlers por rota (apenas as queries client-side; stats/SSR vêm do stub).
const ROUTE_MOCKS: Record<string, Record<string, () => unknown>> = {
  "/dashboard": {
    ...emptyDashboardQueries,
    OrdersByPeriod: () => ({ orders_by_period: { edges: [], totalCount: 0 } }),
    CompanyClientsCount: () => ({ company_clients_count: { totalCount: 0 } }),
  },
  "/routines": { VisitSchedules: () => ({ visit_schedules: conn() }) },
  "/clients": { Clients: () => ({ clients_list: conn() }) },
  "/orders": {
    Orders: () => ({ orders_list: conn() }),
    OrderStats: () => ({
      orderStats: {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
      },
    }),
  },
  "/factories": {
    CompanyFactories: () => ({ company_factories_list: conn() }),
  },
  "/settings/users": { Users: () => ({ users_list: conn() }) },
  "/sellers": {
    Sellers: () => ({ sellers_list: conn() }),
    SellerFactoryAccessList: () => ({ seller_factory_access_list: conn() }),
  },
  "/settings/catalog": {
    SettingsProductCategories: () => ({ product_categories: conn() }),
    SettingsProductUnits: () => ({ productUnits: conn() }),
    SettingsProductUnitLabels: () => ({ productUnitLabels: conn() }),
    SettingsTaxRules: () => ({ taxRules: conn() }),
  },
};

async function pageOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
}

test.describe("responsividade — mobile", () => {
  test.use({ viewport: MOBILE });

  test("shell: hambúrguer abre e fecha o drawer", async ({ page }) => {
    await mockGraphql(page, ROUTE_MOCKS["/dashboard"]);
    await page.goto("/dashboard");

    const burger = page.getByRole("button", {
      name: "Abrir menu",
      exact: true,
    });
    await expect(burger).toBeVisible();

    const aside = page.locator("aside").first();
    const asideX = async () => (await aside.boundingBox())!.x;
    // Fechado: sidebar fora da tela à esquerda (translate-x-full).
    expect(await asideX()).toBeLessThan(0);

    await burger.click();
    // Aberto: sidebar entra na tela. `expect.poll` re-mede o boundingBox até a
    // transição do drawer terminar — sem depender do tempo exato da animação.
    await expect.poll(asideX).toBeGreaterThanOrEqual(0);

    // Clicar no backdrop (fora da sidebar) fecha o drawer.
    await page
      .getByTestId("drawer-backdrop")
      .click({ position: { x: 320, y: 400 } });
    await expect.poll(asideX).toBeLessThan(0);
  });

  for (const [url, handlers] of Object.entries(ROUTE_MOCKS)) {
    test(`sem overflow horizontal: ${url}`, async ({ page }) => {
      await mockGraphql(page, handlers);
      await page.goto(url);
      // Espera o conteúdo assentar (queries client-side servidas + layout) em
      // vez de um tempo fixo: só então a medição de overflow é confiável.
      await expect(page.locator("main")).toBeVisible();
      // `networkidle` é o sinal FELIZ (mocks respondem na hora, fica ocioso em
      // <1s), mas não pode ser bloqueante: qualquer gotejo de rede (prefetch
      // dos links da sidebar, polling de notificações) impede os 500ms de
      // silêncio e estourava o teste com a página já renderizada. Com o teto,
      // segue-se para a medição — o `main` visível + mocks instantâneos
      // garantem o layout pronto.
      await page
        .waitForLoadState("networkidle", { timeout: 10_000 })
        .catch(() => {});
      expect(
        await pageOverflow(page),
        `overflow em ${url}`
      ).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("responsividade — desktop", () => {
  test.use({ viewport: DESKTOP });

  test("sidebar fixa visível e sem hambúrguer", async ({ page }) => {
    await mockGraphql(page, ROUTE_MOCKS["/dashboard"]);
    await page.goto("/dashboard");

    // Sidebar em fluxo: itens visíveis sem abrir nada. O `toBeVisible`
    // auto-espera — não é preciso um atraso fixo antes de afirmar.
    await expect(
      page.getByRole("link", { name: "Clientes", exact: true })
    ).toBeVisible();
    // Hambúrguer não aparece no desktop.
    await expect(
      page.getByRole("button", { name: "Abrir menu", exact: true })
    ).toBeHidden();
  });
});
