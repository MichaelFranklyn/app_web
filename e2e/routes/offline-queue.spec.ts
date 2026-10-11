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
 * Visita e estoque registrados sem sinal (`@/services/offlineQueue`).
 *
 * O cenário é o da loja: a rotina já está aberta, o sinal cai, o vendedor marca
 * a visita e o estoque. Nada se perde — fica no aparelho, a tela mostra que
 * está esperando, e quando o servidor volta a responder a fila envia sozinha,
 * com a HORA DO TOQUE (não a do envio).
 */
test("sem sinal, concluir a visita fica guardado e vai sozinho quando o sinal volta", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...baseMocks,
    OfflineUpdateVisitStatus: () => ({
      updateVisitScheduleItem: {
        ...OK,
        data: { id: "it-1", status: "COMPLETED" },
      },
    }),
  });
  const network = await controlNetwork(page);

  await page.goto("/routines");
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await expect(card).toBeVisible();

  network.down = true;
  const tappedAt = Date.now();
  await concludeVisit(page, card);

  // A pessoa sabe que não perdeu nada e que não precisa marcar de novo.
  await expect(
    page.getByText(/Sem sinal: visita guardada no aparelho/)
  ).toBeVisible();
  await expect(card.getByText("Realizada · aguardando sinal")).toBeVisible();
  await expect(page.getByTestId("offline-queue-banner")).toContainText(
    "1 registro"
  );

  network.down = false;
  await signalBack(page);

  const sent = await spy.waitForCall("OfflineUpdateVisitStatus");
  expect(sent.id).toBe("it-1");
  const input = sent.input as { status: string; actualVisitAt: string };
  expect(input.status).toBe("COMPLETED");
  // A hora da visita é a do toque, não a do envio.
  expect(
    Math.abs(new Date(input.actualVisitAt).getTime() - tappedAt)
  ).toBeLessThan(10_000);

  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);
  await expect(
    page.getByText(/1 registro enviado para o sistema/)
  ).toBeVisible();
});

test("sem sinal, o estoque fica guardado e chega com o dia em que foi visto", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...baseMocks,
    OfflineSaveStockObservations: () => ({
      saveVisitStockObservations: OK,
    }),
    OfflineUpdateVisitStatus: () => ({
      updateVisitScheduleItem: {
        ...OK,
        data: { id: "it-1", status: "COMPLETED" },
      },
    }),
  });
  const network = await controlNetwork(page);

  await page.goto("/routines");
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await card.locator('[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Estoque do cliente" }).click();
  const modal = page.getByLabel("Estoque · Cliente LTDA");
  await expect(modal.getByText("Cimento Forte")).toBeVisible();

  network.down = true;
  await modal.getByRole("button", { name: "Já acabou" }).first().click();
  await modal.getByRole("button", { name: /Salvar/ }).click();

  await expect(
    page.getByText(/Sem sinal: estoque guardado no aparelho/)
  ).toBeVisible();
  // Estoque grava e conclui a visita: os dois ficam esperando, na ordem.
  await expect(page.getByTestId("offline-queue-banner")).toContainText(
    "2 registros"
  );

  network.down = false;
  await signalBack(page);

  const stock = await spy.waitForCall("OfflineSaveStockObservations");
  expect(stock.itemId).toBe("it-1");
  expect(stock.observations).toEqual([{ productId: "p-1", daysRemaining: 0 }]);
  expect(stock.observedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await spy.waitForCall("OfflineUpdateVisitStatus");
  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);
});

test("o que o servidor recusa ao chegar fica avisado até a pessoa ler", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...baseMocks,
    OfflineUpdateVisitStatus: () => ({
      updateVisitScheduleItem: {
        status: false,
        message: "Visita não encontrada.",
        data: null,
      },
    }),
  });
  const network = await controlNetwork(page);

  await page.goto("/routines");
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await expect(card).toBeVisible();

  network.down = true;
  await concludeVisit(page, card);
  await expect(page.getByTestId("offline-queue-banner")).toBeVisible();

  network.down = false;
  await signalBack(page);

  const failures = page.getByTestId("offline-failures-banner");
  await expect(failures).toContainText("Cliente LTDA");
  await expect(failures).toContainText("Visita não encontrada");
  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);

  await failures.getByRole("button", { name: "Entendi" }).click();
  await expect(failures).toHaveCount(0);
});
