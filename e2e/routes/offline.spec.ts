import { expect, test } from "../support/fixtures";

/**
 * Tela sem conexão do PWA (`/offline`) — a que o service worker serve quando a
 * navegação falha.
 *
 * Só faz sentido num navegador de verdade: o ponto da tela é que ela NÃO
 * confia no `navigator.onLine` (que responde "existe interface de rede?", não
 * "a internet funciona") e sonda o servidor. O cenário que a motivou é
 * exatamente o que os testes montam — aparelho "online", servidor inalcançável.
 */
const SONDAGEM = "**/manifest.webmanifest";

test("offline: com o servidor inalcançável, não promete o que a rede não cumpre", async ({
  page,
}) => {
  await page.route(SONDAGEM, (route) => route.abort());

  await page.goto("/offline");

  await expect(page.getByText("Sem conexão")).toBeVisible();
  await expect(
    page.getByText(/O app volta a funcionar assim que o sinal aparecer/)
  ).toBeVisible();
  // Enquanto não voltou, o botão continua ali para quem quiser insistir — mas
  // discreto, e sem anunciar que dá para continuar.
  await expect(
    page.getByRole("button", { name: "Tentar de novo" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar" })).toHaveCount(0);
});

test("offline: quando o servidor responde de novo, a tela avisa sozinha", async ({
  page,
}) => {
  // Ninguém que está esperando o sinal deveria ter de tocar na tela para
  // descobrir que ele voltou.
  let servidorDePe = false;
  await page.route(SONDAGEM, async (route) => {
    if (!servidorDePe) return route.abort();
    await route.fulfill({ status: 200, body: "{}" });
  });

  await page.goto("/offline");
  await expect(
    page.getByRole("button", { name: "Tentar de novo" })
  ).toBeVisible();

  servidorDePe = true;

  // A sondagem roda a cada 5s; a espera cobre uma volta com folga.
  await expect(
    page.getByText(
      "A conexão voltou. Toque no botão para continuar de onde parou."
    )
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
});

test("offline: se a rede cair de novo, a tela deixa de dizer que dá para continuar", async ({
  page,
}) => {
  // A primeira versão parava de sondar depois de anunciar a volta, e a tela
  // ficava presa no "pode continuar" com a rede já caída — que é a vida dentro
  // de uma loja.
  let servidorDePe = true;
  await page.route(SONDAGEM, async (route) => {
    if (!servidorDePe) return route.abort();
    await route.fulfill({ status: 200, body: "{}" });
  });

  await page.goto("/offline");
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible({
    timeout: 15_000,
  });

  servidorDePe = false;

  await expect(
    page.getByRole("button", { name: "Tentar de novo" })
  ).toBeVisible({ timeout: 15_000 });
});
