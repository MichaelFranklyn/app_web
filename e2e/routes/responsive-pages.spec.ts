import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";
import { descreveProblemas, medirLayout } from "../support/layout";
import { PAGE_DATA, PAGE_READY } from "../support/pageData";

/**
 * Responsividade das telas que nasceram depois da primeira guarda.
 *
 * O `responsive.spec.ts` cobre o shell (drawer/sidebar) e oito rotas; daquela
 * época para cá entraram comissões, metas, insights, os dez relatórios, o
 * console, as abas da fábrica e do cliente. Aqui cada rota é medida no MENOR
 * telefone que o projeto declara (320px, o breakpoint `mobile`) e no tablet.
 *
 * Duas listas, porque os defeitos são de naturezas diferentes:
 *  - COM DADOS: é com linha na tabela, nome longo e botão ao lado do valor que
 *    a largura aperta. Cada rota exige um texto do próprio conteúdo antes de
 *    medir — medir uma tela que caiu em "não foi possível carregar" passaria
 *    sempre, e foi assim que as páginas novas ficaram fora do radar.
 *  - VAZIAS: o estado inicial de toda tela nova, onde mora o estado vazio (que
 *    saía cortado dentro da célula `whitespace-nowrap` da tabela).
 */
const MOBILE = { width: 320, height: 720 };
const TABLET = { width: 760, height: 1024 };

/** Telas sem mock: o "nada aqui" também precisa caber. */
const ROTAS_VAZIAS = [
  "/settings",
  "/settings/catalog",
  "/settings/catalog/categories",
  "/settings/catalog/units",
  "/settings/catalog/labels",
  "/settings/catalog/tax-rules",
  "/settings/catalog/segments",
  "/clients/networks",
  "/dashboard/analytics",
  "/dashboard/reports",
  "/dashboard/reports/sales",
  "/dashboard/reports/commissions",
  "/dashboard/reports/clients",
  "/dashboard/reports/sent-orders",
  "/goals/seller-1",
  "/factories/factory-1/overview",
  "/factories/factory-1/sellers",
  "/factories/factory-1/clients",
  "/factories/factory-1/orders",
  "/factories/factory-1/import-template",
  "/clients/cc-1/factories",
  "/clients/cc-1/visits",
  "/clients/cc-1/score",
  "/clients/cc-1/stock",
  "/clients/cc-1/products",
  "/clients/cc-1/support",
  "/routines/2026-09-10",
  "/platform",
  "/platform/companies",
  "/platform/users",
  "/platform/team",
  "/platform/activity",
  "/platform/audit",
  "/platform/health",
  "/platform/plans",
];

async function abrir(page: import("@playwright/test").Page, url: string) {
  // O console é do super usuário: com o papel padrão (vendedor) a tela é a de
  // recusa, e medir layout nela não diria nada sobre o console.
  if (url.startsWith("/platform"))
    await grantRole(page, "SU", { alsoJwt: true });
  await page.goto(url);
  await expect(page.locator("main")).toBeVisible();
  // O mesmo teto do responsive.spec: `networkidle` é o sinal feliz, não uma
  // condição — prefetch da sidebar e polling de notificação impedem o silêncio.
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
}

/**
 * O portal do cliente abre SEM sessão e é a tela mais aberta no telefone: fica
 * num bloco próprio porque precisa do storageState vazio. Os dados vêm do
 * stub (PortalProfile/PortalPurchases/PortalStock).
 */
const PORTAL_TOKEN = "token-de-teste-do-portal";
const ROTAS_PORTAL = [`/p/${PORTAL_TOKEN}`, `/p/${PORTAL_TOKEN}/estoque`];

for (const [viewport, nome] of [
  [MOBILE, "mobile 320"],
  [TABLET, "tablet 760"],
] as const) {
  test.describe(`páginas — ${nome}`, () => {
    test.use({ viewport });

    for (const [url, handlers] of Object.entries(PAGE_DATA)) {
      test(`com conteúdo: ${url}`, async ({ page }) => {
        await mockGraphql(page, handlers);
        await abrir(page, url);

        const pronta = PAGE_READY[url];
        if (pronta) {
          // Prova que a tela montou COM o conteúdo — sem isto, a medição
          // abaixo estaria olhando para um estado de erro.
          await expect(
            page.locator("main").getByText(pronta).first()
          ).toBeVisible();
        }

        const problemas = await medirLayout(page);
        expect(
          problemas.overflowPagina <= 1 &&
            problemas.largos.length === 0 &&
            problemas.clipados.length === 0,
          descreveProblemas(url, problemas)
        ).toBe(true);
      });
    }

    for (const url of ROTAS_VAZIAS) {
      test(`vazia: ${url}`, async ({ page }) => {
        await mockGraphql(page, {});
        await abrir(page, url);

        const problemas = await medirLayout(page);
        expect(
          problemas.overflowPagina <= 1 &&
            problemas.largos.length === 0 &&
            problemas.clipados.length === 0,
          descreveProblemas(url, problemas)
        ).toBe(true);
      });
    }
  });
}

for (const [viewport, nome] of [
  [MOBILE, "mobile 320"],
  [TABLET, "tablet 760"],
] as const) {
  test.describe(`portal do cliente — ${nome}`, () => {
    test.use({ viewport, storageState: { cookies: [], origins: [] } });

    for (const url of ROTAS_PORTAL) {
      test(`sem sessão: ${url}`, async ({ page }) => {
        await page.goto(url);
        await expect(page.locator("main")).toBeVisible();
        await page
          .waitForLoadState("networkidle", { timeout: 8000 })
          .catch(() => {});

        const problemas = await medirLayout(page);
        expect(
          problemas.overflowPagina <= 1 &&
            problemas.largos.length === 0 &&
            problemas.clipados.length === 0,
          descreveProblemas(url, problemas)
        ).toBe(true);
      });
    }
  });
}
