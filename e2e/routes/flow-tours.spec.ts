import { FLOWS, getVisibleSteps } from "@/services/flowTour/flows";
import { UserRole } from "@/app/(auth)/login/interface";

import { expect, test } from "../support/fixtures";
import { Handler, mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Os tutoriais guiados, rodados de verdade num navegador.
 *
 * O teste de contrato (`flows.contract.test.ts`) garante que o seletor de cada
 * passo existe NO CÓDIGO. Só que existir no código não é estar no DOM na hora
 * de mirar: um alvo que só renderiza com dado, ou atrás de um gate de papel,
 * faz o motor pular o passo — em silêncio, como manda o desenho. O tutorial
 * encolhe e ninguém percebe.
 *
 * Aqui a conta é a que interessa: o contador do card ("X de N") tem de dizer o
 * MESMO N que `getVisibleSteps` promete para o papel logado. Passo pulado por
 * alvo ausente derruba o N, e o teste acusa. Rodar nos DOIS papéis é o que
 * prende o gating: nas Oportunidades o gestor vê quatro passos e o vendedor três, e
 * um `roles` errado apareceria como número trocado em um dos dois.
 *
 * O tour é aberto pelo LANÇADOR, e não pelo auto-start: é o caminho de quem
 * pede o tutorial de novo, e não depende de o papel já ter chegado do cookie.
 *
 * Comissões e Metas ficam de fora daqui: os passos de conteúdo delas exigem o
 * resumo do mês inteiro montado, e o mock que sustenta isso é maior que o
 * próprio teste. Os seletores dos dois seguem presos pelo teste de contrato.
 */

/** Progresso do tour: sem resposta, o motor fica em `loading` e não abre nada. */
const TOUR_HANDLERS: Record<string, Handler> = {
  userFlowLayout: () => ({
    userFlowLayout: { status: true, code: 200, message: "ok", data: [] },
  }),
  upsertUserFlowLayout: () => ({
    upsertUserFlowLayout: {
      status: true,
      code: 200,
      message: "ok",
      data: null,
    },
  }),
};

/**
 * Dado mínimo por rota para os passos de CONTEÚDO existirem. Não vem do
 * `pageData.ts` de propósito: lá o volume é escolhido para medir largura, e o
 * que importa aqui é outra coisa — cada alvo do tour presente uma vez.
 */
const DADOS: Record<string, Record<string, Handler>> = {
  "/opportunities": {
    MyOpportunities: () => ({
      myInsights: {
        status: true,
        message: "ok",
        data: {
          generatedAt: "2026-09-11T09:00:00Z",
          insights: [
            {
              kind: "CLIENT_OVERDUE",
              count: 23,
              blockedCount: 0,
              samples: [
                {
                  id: "c-1",
                  label: "DECORE CASA & CONSTRUCAO LTDA ME",
                  detail: "348 dias sem comprar",
                  link: null,
                  reason: null,
                  clientId: "c-1",
                  nextFollowUpDate: null,
                  nextVisitDate: null,
                },
              ],
            },
          ],
        },
      },
    }),
    // Só o gestor pede esta (o vendedor já vê a própria carteira): sem ela, a
    // resposta vazia do fallback derruba a tela para o gestor e todos os
    // passos de conteúdo somem.
    OpportunitiesSellers: () => ({
      opportunities_sellers: {
        edges: [
          { node: { id: "seller-1", name: "Rafael Vendas", isActive: true } },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
  },
  "/pending": {
    MyPendingItems: () => ({
      myPendingItems: {
        status: true,
        message: "ok",
        data: {
          generatedAt: "2026-10-11T10:00:00Z",
          totalCount: 1,
          counts: [{ type: "ORDER_STALLED", count: 1, highCount: 0 }],
          whenCounts: [{ when: "OVERDUE", count: 1, highCount: 0 }],
          items: [
            {
              id: "PENDING_INVOICE:o-1:seller-1",
              entityId: "o-1",
              clientId: "client-1",
              type: "ORDER_STALLED",
              reason: "PENDING_INVOICE",
              priority: "MEDIUM",
              dueDate: "2026-10-09",
              daysLate: 2,
              clientName: "Decore Casa",
              link: "/orders/o-1",
              clientLink: "/clients/cc-1",
              factoryName: "Herc",
              sellerId: "seller-1",
              sellerName: "Rafael Vendas",
              amount: "1500.00",
              referenceDate: "2026-10-02",
              isRemote: false,
              allowanceDays: 7,
              isEstimated: false,
              highAfterDays: 15,
              scheduledDate: null,
              note: null,
              orderId: "o-1",
              orderDate: "2026-10-02",
              contactPhone: null,
              installmentCount: null,
            },
          ],
        },
      },
    }),
    PendingSellers: () => ({
      pending_sellers: {
        edges: [
          { node: { id: "seller-1", name: "Rafael Vendas", isActive: true } },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
  },
  // Nenhum passo destes depende de conteúdo: a faixa de contagem, a tabela, as
  // abas e a barra de recorte desenham vazias.
  "/support": {},
  "/dashboard/reports/sales": {},
  "/dashboard/analytics": {
    DashboardSummary: () => ({
      dashboardSummary: {
        totalOrders: 12,
        totalAmount: "150000.00",
        avgTicket: "12500.00",
        activeClients: 8,
      },
    }),
  },
};

const PAPEIS: UserRole[] = ["SELLER", "OWNER"];

for (const rota of Object.keys(DADOS)) {
  for (const papel of PAPEIS) {
    test(`tour de ${rota} não perde passo (${papel})`, async ({ page }) => {
      const flow = Object.values(FLOWS).find((f) => f.route === rota);
      expect(flow, `nenhum fluxo registrado para ${rota}`).toBeTruthy();
      const esperados = getVisibleSteps(flow!, papel).length;

      await mockGraphql(page, { ...TOUR_HANDLERS, ...DADOS[rota] });
      // O storageState nasce como vendedor; o papel de gestor é forjado no
      // cookie, que é de onde a tela e o tour leem (ver support/role.ts).
      await grantRole(page, papel);
      await page.goto(rota);

      await page.getByRole("button", { name: "Ajuda e tutoriais" }).click();
      await page.getByText(flow!.label).click();

      const contador = page.getByText(/^\d+ de \d+$/);
      await expect(contador).toBeVisible({ timeout: 15_000 });
      await expect(contador).toHaveText(`1 de ${esperados}`);

      // Caminha até o fim: cada "Próximo" tem de achar o alvo do passo seguinte.
      for (let passo = 2; passo <= esperados; passo += 1) {
        // `exact`: "Próximo" também casa com "Próximos 7 dias" (Pendências).
        await page
          .getByRole("button", { name: "Próximo", exact: true })
          .click();
        await expect(contador).toHaveText(`${passo} de ${esperados}`);
      }

      await page.getByRole("button", { name: "Concluir" }).click();
      await expect(contador).toHaveCount(0);
    });
  }
}
