import { encryptKeyName, encryptValue } from "@/utils/cookies/helpersCookie";
import type { BrowserContext, Page } from "@playwright/test";

import { SW_BASE_URL } from "../../playwright.sw.config";
import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import {
  OK,
  baseMocks,
  concludeVisit,
  controlNetwork,
  signalBack,
} from "../support/routineOffline";

/**
 * A fila offline num navegador de verdade, com o SERVICE WORKER LIGADO.
 *
 * É o percurso do vendedor dentro da loja: a rotina está aberta, o sinal cai,
 * ele marca a visita, guarda o celular (a aba morre) e só volta a ter sinal no
 * carro. O que se exige: o toque não some, e chega ao servidor UMA vez — mesmo
 * com duas abas abertas, e nunca pela mão de outra pessoa que entre no aparelho.
 */
const QUEUE_KEY = "girus:offline-queue:v1";

/** Conta os envios somando TODAS as abas — a duplicidade aparece na soma. */
function sentCounter() {
  const calls: Record<string, unknown>[] = [];
  const handlers = {
    ...baseMocks,
    OfflineUpdateVisitStatus: (variables: Record<string, unknown>) => {
      calls.push(variables);
      return {
        updateVisitScheduleItem: {
          ...OK,
          data: { id: "it-1", status: "COMPLETED" },
        },
      };
    },
  };
  return { calls, handlers };
}

/** Quem está logado no aparelho — é o `userId` deste cookie que assina a entrada da fila. */
async function loginAs(context: BrowserContext, userId: string) {
  await context.addCookies([
    {
      name: encryptKeyName("userData"),
      value: encryptValue(
        JSON.stringify({
          userId,
          userName: `Pessoa ${userId}`,
          companyName: "Empresa Teste",
          role: "SELLER",
          sellerId: "seller-1",
        })
      ),
      url: SW_BASE_URL,
    },
  ]);
}

/**
 * Corta a rede do APARELHO: página e service worker. `setOffline` sozinho só
 * muda o `navigator.onLine` e as requisições da página; as do service worker
 * continuam saindo, e é por ele que a navegação passa.
 */
async function cutNetwork(context: BrowserContext) {
  const state = { offline: false };
  await context.route("**/*", (route) =>
    state.offline ? route.abort("internetdisconnected") : route.fallback()
  );
  return {
    async off() {
      state.offline = true;
      await context.setOffline(true);
    },
    async on() {
      state.offline = false;
      await context.setOffline(false);
    },
  };
}

/**
 * Faz o servidor DEMORAR a responder a gravação. Sem isto a resposta simulada
 * é instantânea: a primeira aba termina antes de a segunda começar, e a corrida
 * que duplicava o envio nunca acontece no teste — ele passava até com a fila
 * antiga, que mandava duas vezes no aparelho de verdade.
 */
async function slowWrites(page: Page, ms: number) {
  await page.route("**/graphql", async (route) => {
    const op = (route.request().postDataJSON() as { operationName?: string })
      ?.operationName;
    if (op === "OfflineUpdateVisitStatus") {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
    return route.fallback();
  });
}

/** Só segue quando o service worker já CONTROLA a página — antes disso ele não intercepta nada. */
async function waitForServiceWorker(page: Page) {
  await page.waitForFunction(
    async () => {
      if (!("serviceWorker" in navigator)) return false;
      await navigator.serviceWorker.ready;
      return !!navigator.serviceWorker.controller;
    },
    undefined,
    { timeout: 30_000 }
  );
}

const queued = (page: Page) =>
  page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw
      ? (JSON.parse(raw).entries as { key: string; userId: string }[])
      : [];
  }, QUEUE_KEY);

const routineCard = (page: Page) =>
  page.getByRole("button", { name: /Cliente LTDA/ });

/** Abre a rotina numa aba nova do mesmo navegador, com os mesmos mocks. */
async function openRoutine(
  context: BrowserContext,
  handlers: Record<string, (v: Record<string, unknown>) => unknown>,
  { down = false } = {}
) {
  const page = await context.newPage();
  await mockGraphql(page, handlers);
  const network = await controlNetwork(page);
  // Antes de abrir: a tela descarrega a fila assim que monta, e uma aba que
  // nascesse "com sinal" mandaria o registro antes de o teste olhar.
  network.down = down;
  await page.goto("/routines");
  await expect(routineCard(page)).toBeVisible();
  return { page, network };
}

test.beforeEach(async ({ page }) => {
  // Um contexto novo por teste, mas o registro do SW é assíncrono: a primeira
  // visita o instala, e só a partir daí ele responde pela origem.
  await mockGraphql(page, baseMocks);
  await page.goto("/routines");
  await waitForServiceWorker(page);
});

test("sem sinal: a visita fica guardada, sobrevive a fechar a aba e chega uma vez só", async ({
  page,
  context,
}) => {
  const { calls, handlers } = sentCounter();
  await mockGraphql(page, handlers);
  const network = await controlNetwork(page);
  const device = await cutNetwork(context);
  await page.reload();
  await expect(routineCard(page)).toBeVisible();

  // O sinal cai DE VERDADE: nem a navegação alcança o servidor.
  network.down = true;
  await device.off();
  await concludeVisit(page, routineCard(page));
  await expect(page.getByTestId("offline-queue-banner")).toContainText(
    "1 registro"
  );

  // O vendedor guarda o celular — a aba morre com a visita ainda na fila.
  await page.close();

  // Reabre SEM sinal: quem responde é o service worker, com a tela offline.
  const reopened = await context.newPage();
  await reopened.goto("/routines", { waitUntil: "domcontentloaded" });
  await expect(reopened.getByText("Sem conexão")).toBeVisible();
  // O toque continua no aparelho, e nada foi enviado no escuro.
  expect(await queued(reopened)).toHaveLength(1);
  expect(calls).toHaveLength(0);

  // O sinal volta e ele abre a rotina de novo.
  await device.on();
  await mockGraphql(reopened, handlers);
  await reopened.goto("/routines");
  await expect(routineCard(reopened)).toBeVisible();

  await expect.poll(() => calls.length).toBe(1);
  await expect.poll(() => queued(reopened)).toHaveLength(0);
  await expect(reopened.getByTestId("offline-queue-banner")).toHaveCount(0);

  // Reabrir de novo não reenvia: a fila esvaziou de verdade.
  await reopened.reload();
  await expect(routineCard(reopened)).toBeVisible();
  await reopened.waitForTimeout(1_500);
  expect(calls).toHaveLength(1);
  expect((calls[0] as { id: string }).id).toBe("it-1");
});

test("duas abas abertas: o sinal volta para as duas e o registro vai uma vez só", async ({
  page,
  context,
}) => {
  const { calls, handlers } = sentCounter();
  await mockGraphql(page, handlers);
  const first = await controlNetwork(page);
  await page.reload();
  await expect(routineCard(page)).toBeVisible();

  first.down = true;
  await concludeVisit(page, routineCard(page));
  await expect(page.getByTestId("offline-queue-banner")).toBeVisible();

  // Segunda aba do mesmo aparelho (ou a aba + o app instalado), ainda sem sinal.
  const second = await openRoutine(context, handlers, { down: true });
  await slowWrites(page, 1_500);
  await slowWrites(second.page, 1_500);
  await expect(second.page.getByTestId("offline-queue-banner")).toContainText(
    "1 registro"
  );

  // O sinal volta para as duas NO MESMO INSTANTE — a corrida que duplicava.
  first.down = false;
  second.network.down = false;
  await Promise.all([signalBack(page), signalBack(second.page)]);

  await expect.poll(() => queued(page)).toHaveLength(0);
  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);
  await expect(second.page.getByTestId("offline-queue-banner")).toHaveCount(0);

  // Folga para um eventual segundo envio aparecer antes de afirmar que não houve.
  await page.waitForTimeout(3_000);
  expect(calls).toHaveLength(1);
});

test("troca de usuário no aparelho: o registro não some nem vai pela mão de outra pessoa", async ({
  page,
  context,
}) => {
  const { calls, handlers } = sentCounter();
  await loginAs(context, "vendedor-a");
  await mockGraphql(page, handlers);
  const network = await controlNetwork(page);
  await page.reload();
  await expect(routineCard(page)).toBeVisible();

  network.down = true;
  await concludeVisit(page, routineCard(page));
  await expect(page.getByTestId("offline-queue-banner")).toBeVisible();
  expect(await queued(page)).toEqual([
    expect.objectContaining({ key: "visit:it-1", userId: "vendedor-a" }),
  ]);

  // Outra pessoa entra no MESMO aparelho, já com sinal.
  network.down = false;
  await loginAs(context, "vendedor-b");
  await page.reload();
  await expect(routineCard(page)).toBeVisible();
  await signalBack(page);
  await page.waitForTimeout(2_000);

  // Ela não vê a pendência da outra, não a envia, e não a apaga.
  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);
  expect(calls).toHaveLength(0);
  expect(await queued(page)).toEqual([
    expect.objectContaining({ userId: "vendedor-a" }),
  ]);

  // A dona volta: o registro dela ainda está lá e vai — uma vez.
  await loginAs(context, "vendedor-a");
  await page.reload();
  await expect(routineCard(page)).toBeVisible();

  await expect.poll(() => calls.length).toBe(1);
  await expect.poll(() => queued(page)).toHaveLength(0);
  await page.waitForTimeout(1_500);
  expect(calls).toHaveLength(1);
});
