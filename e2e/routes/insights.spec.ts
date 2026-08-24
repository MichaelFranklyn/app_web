import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * A tela de insights: o que está pendente HOJE e por quê.
 *
 * O que estes testes prendem é o que diferencia esta tela de uma lista de
 * avisos: cada cartão traz o MOTIVO por extenso e o caminho para resolver, e a
 * tela vazia é uma boa notícia, não um erro.
 */
const insight = (over: Record<string, unknown> = {}) => ({
  kind: "CLIENT_OVERDUE",
  group: "WALLET",
  count: 23,
  amount: null,
  daysLeft: null,
  samples: [
    {
      id: "c-1",
      label: "DECORE CASA & CONSTRUCAO",
      detail: "348 dias sem comprar",
      link: null,
    },
  ],
  ...over,
});

const overview = (insights: Array<Record<string, unknown>>) => ({
  myInsights: {
    status: true,
    message: "ok",
    data: { generatedAt: "2026-08-24T10:00:00Z", insights },
  },
});

test("insights: cada pendência traz o número, o motivo e a saída", async ({
  page,
}) => {
  await mockGraphql(page, { MyInsights: () => overview([insight()]) });

  await page.goto("/insights");

  await expect(
    page.getByText("23 clientes passaram do próprio ritmo de compra")
  ).toBeVisible();
  // O porquê é o que transforma o número em decisão — sem ele a tela é um log.
  await expect(
    page.getByText(/repõe a prateleira com outro representante/i)
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ver na carteira" })
  ).toBeVisible();
  // O exemplo dá nome a quem está atrasado.
  await expect(page.getByText("DECORE CASA & CONSTRUCAO")).toBeVisible();
});

test("insights: o mais caro primeiro, não o mais numeroso", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyInsights: () =>
      overview([
        insight({ kind: "NO_VISIT_30D", count: 136, samples: [] }),
        insight({
          kind: "INSTALLMENT_OVERDUE",
          group: "MONEY",
          count: 3,
          amount: "4500.00",
          samples: [],
        }),
      ]),
  });

  await page.goto("/insights");

  // A leitura chega por query do cliente: espera o primeiro cartão pintar antes
  // de fotografar a ordem, senão a lista sai vazia e a asserção mente.
  await expect(
    page.getByRole("heading", { name: "Resolver hoje", level: 4 })
  ).toBeVisible();

  // Títulos de seção e de cartão são o mesmo `heading-sm` do Title (<h4>), então
  // a lista abaixo é a tela inteira na ordem em que ela é lida.
  const titles = await page
    .getByRole("heading", { level: 4 })
    .allTextContents();

  // Boleto vencido custa dinheiro hoje; 136 clientes sem visita há um mês é
  // sinal de fundo. Ordenar por contagem enterraria o que precisa de ação.
  const urgente = titles.findIndex((t) => t.includes("Resolver hoje"));
  const boleto = titles.findIndex((t) => t.includes("boletos vencidos"));
  const fundo = titles.findIndex((t) => t.includes("De olho"));

  expect(urgente).toBe(0);
  expect(boleto).toBe(1);
  expect(fundo).toBeGreaterThan(boleto);
});

test("insights: sem pendência, a tela diz que está tudo em dia", async ({
  page,
}) => {
  await mockGraphql(page, { MyInsights: () => overview([]) });

  await page.goto("/insights");

  await expect(page.getByText("Nada pendente")).toBeVisible();
});
