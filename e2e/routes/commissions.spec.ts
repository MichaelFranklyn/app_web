import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * A tela de comissões pede ao backend UM MÊS por vez.
 *
 * Antes ela baixava a carteira inteira e recortava no cliente: numa carteira de
 * pouco mais de um ano, 84% do que trafegava era descartado, e a conta piorava a
 * cada mês de histórico. O que estes testes protegem é o contrato desse recorte
 * — o período que sai na consulta e as duas exceções que a tela mostra fora do
 * mês (a aba de boletos travados, e o painel de estorno do vendedor).
 *
 * O usuário do storageState é um VENDEDOR: sem seletor de vendedor e sem os
 * botões de gestão, o que sobra na tela é exatamente o recorte.
 */

const AGOSTO = { from: "2026-08-01", to: "2026-08-31" };

/** Uma linha de comissão como o backend a devolve. */
function row(overrides: Record<string, unknown> = {}) {
  return {
    orderId: "order-1",
    installmentId: "inst-1",
    sequence: 1,
    orderDate: "2026-07-02",
    invoicedAt: "2026-07-10",
    invoiceNumber: "12345",
    dueDate: "2026-08-09",
    paidAt: null,
    installmentAmount: "1000.00",
    amount: "50.00",
    status: "receivable",
    receiveDate: "2026-08-09",
    isReceivable: true,
    isReceived: false,
    isReconciled: false,
    reconciledAt: null,
    isOverdue: false,
    defaultedAt: null,
    isChargebackSettled: false,
    chargebackSettledAt: null,
    sellerAmount: "50.00",
    sellerStatus: "receivable",
    sellerReceiveDate: "2026-08-09",
    isSellerPaid: false,
    sellerChargebackMonth: null,
    isSellerChargebackSettled: false,
    sellerChargebackSettledAt: null,
    client: {
      id: "client-1",
      razaoSocial: "CASA DO SONO LTDA",
      nomeFantasia: "Casa do Sono",
    },
    factory: {
      id: "factory-1",
      nomeFantasia: "Herc",
      nickname: null,
      razaoSocial: "INDUSTRIA HERC LTDA",
    },
    seller: { id: "seller-1", name: "Vendedor Teste" },
    ...overrides,
  };
}

function summary(rows: ReturnType<typeof row>[]) {
  return {
    commissions: {
      // Medida ANTES do recorte: é por ela que a tela sabe em que mês abrir.
      latestReceiveDate: "2026-08-09",
      totalReceivable: "50.00",
      totalReceived: "0",
      totalPending: "0",
      countReceivable: rows.length,
      totalChargeback: "0",
      totalSellerChargeback: "0",
      totalSellerChargebackPending: "0",
      totalRefund: "0",
      totalSellerRefund: "0",
      countOverdue: 0,
      rows,
    },
  };
}

test("comissões: a tela pede o mês ao backend, não a carteira inteira", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Commissions: () => summary([row()]),
  });

  await page.goto("/commissions");

  // O mês da resposta (`latestReceiveDate`) é onde a tela abre — e é ele que
  // volta ao backend como período. Sem isso, a tela abriria no mês corrente e
  // mostraria vazio numa carteira que tem movimento.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain(`"from":"${AGOSTO.from}","to":"${AGOSTO.to}"`);

  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();
  await expect(page.getByText("CASA DO SONO LTDA").first()).toBeVisible();
});

test("comissões: trocar de mês refaz a consulta com o novo período", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Commissions: () => summary([row()]),
  });

  await page.goto("/commissions");
  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

  await page.getByRole("button", { name: "Mês anterior" }).click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain('"from":"2026-07-01","to":"2026-07-31"');
  await expect(page.getByText("Resumo de julho de 2026")).toBeVisible();
});

test("comissões: a aba de boletos travados pede os de todos os vencimentos", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Commissions: () => summary([row()]),
  });

  await page.goto("/commissions");
  await expect(page.getByText("Resumo de agosto de 2026")).toBeVisible();

  await page.getByRole("button", { name: /Boleto em atraso/ }).click();

  // `includeOverdue` é o que traz as linhas de fora do mês. Elas não vêm nas
  // outras abas de propósito: alimentavam uma tela que ninguém estava olhando.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Commissions") ?? {}))
    .toContain('"includeOverdue":true');

  // E a tela avisa que ali o mês não vale — o mesmo que o backend fez.
  await expect(
    page.getByText("Esta aba não segue o mês escolhido")
  ).toBeVisible();
});
