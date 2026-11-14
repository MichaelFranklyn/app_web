import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { PAGE_DATA, PAGE_READY } from "../support/pageData";

/**
 * REGRESSÃO VISUAL — o desenho das telas, pixel a pixel, contra um baseline.
 *
 * As guardas de vitest travam o CÓDIGO (peça do DS, token, tom de texto) e o
 * a11y/responsive travam regras mensuráveis (contraste, overflow). Nenhuma
 * delas vê o que só aparece desenhado: um botão que some atrás do painel (o de
 * recolher, 13/11/2026), um token que muda e repinta 40 telas, um espaçamento
 * que dobra. Aqui a tela inteira é comparada com a foto aprovada.
 *
 * Determinismo:
 *  - dados do stub (`PAGE_DATA`), só rotas cujo mock NÃO anda com o calendário
 *    (comissões ancora no mês corrente e mudaria de foto todo mês);
 *  - `PAGE_READY` prova que a tela montou com conteúdo antes da foto;
 *  - animações e cursor desligados pelo `toHaveScreenshot`;
 *  - fontes via `next/font` (auto-hospedadas — não dependem da rede).
 *
 * O baseline depende da plataforma (sufixo `-chromium-linux`): gere-o no Linux
 * (o mesmo SO do CI, ubuntu-24.04). Para aprovar uma mudança VISUAL de
 * propósito: `npx playwright test e2e/routes/visual.spec.ts --update-snapshots`
 * e revise as imagens no diff antes de commitar.
 */

const ROTAS_COM_DADOS = [
  "/orders/order-1",
  "/clients/cc-1/overview",
  "/factories/factory-1/products",
  "/factories/factory-1/price-lists",
  "/factories/factory-1/contacts",
];

/** Telas sem dado: o estado vazio e as peças fixas do DS (cards, navegação). */
const ROTAS_VAZIAS = ["/settings", "/settings/catalog"];

const VIEWPORTS = [
  { nome: "desktop", viewport: { width: 1366, height: 900 } },
  { nome: "celular", viewport: { width: 375, height: 812 } },
] as const;

const nomeDoArquivo = (url: string, vp: string) =>
  `${url.replace(/^\//, "").replace(/\//g, "_")}-${vp}.png`;

for (const { nome, viewport } of VIEWPORTS) {
  test.describe(`visual — ${nome}`, () => {
    test.use({ viewport });

    for (const url of [...ROTAS_COM_DADOS, ...ROTAS_VAZIAS]) {
      test(url, async ({ page }) => {
        await mockGraphql(page, PAGE_DATA[url] ?? {});
        await page.goto(url);
        await expect(page.locator("main")).toBeVisible();

        const pronta = PAGE_READY[url];
        if (pronta)
          await expect(
            page.locator("main").getByText(pronta).first()
          ).toBeVisible();

        // Mesmo teto do responsive.spec: o polling de notificação impede o
        // silêncio total, então `networkidle` é o caso feliz, não condição.
        await page
          .waitForLoadState("networkidle", { timeout: 8000 })
          .catch(() => {});
        // Imagem que ainda está decodificando sai em branco numa foto e
        // pintada na outra.
        await page.evaluate(() => document.fonts.ready);

        await expect(page).toHaveScreenshot(nomeDoArquivo(url, nome), {
          animations: "disabled",
          caret: "hide",
          // A linha de progresso da navegação pode estar no meio do trajeto.
          mask: [page.locator('[role="progressbar"]')],
          // Teto ABSOLUTO, não proporção: com `maxDiffPixelRatio: 0.002` o
          // desktop (1,2 Mpx) tolerava ~2.400 px, e a borda de TODOS os botões
          // trocada para vermelho passava (provado por mutação, 13/11/2026).
          // O antialias de fonte entre máquinas fica no `threshold` por pixel
          // (padrão 0,2), que não conta tom quase igual como diferença.
          maxDiffPixels: 100,
        });
      });
    }
  });
}
