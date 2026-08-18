import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { UPDATE_VISIT_ITEM_MUTATION } from "../../gql";
import { OverdueVisits } from "./index";
import { OVERDUE_VISITS_QUERY } from "./gql";

type Mocks = ComponentProps<typeof MockedProvider>["mocks"];

const VISIT = {
  __typename: "VisitScheduleItemType",
  id: "v1",
  plannedOrder: 1,
  contactType: "IN_PERSON",
  status: "PENDING",
  day: { __typename: "VisitScheduleDayType", id: "d1", date: "2026-07-31" },
  clientFactoryLink: {
    __typename: "SellerClientFactoryType",
    id: "l1",
    client: {
      __typename: "ClientType",
      id: "c1",
      razaoSocial: "Padaria do Zé LTDA",
      nomeFantasia: "Padaria do Zé",
    },
    factory: {
      __typename: "FactoryType",
      id: "f1",
      razaoSocial: "Fábrica Um LTDA",
      nomeFantasia: "Fábrica Um",
    },
  },
};

const listMock = (visits: unknown[], maxUsageCount = 1) => ({
  request: { query: OVERDUE_VISITS_QUERY, variables: { sellerId: null } },
  result: { data: { overdueVisits: visits } },
  maxUsageCount,
});

/**
 * Responder dispara `refetch`, e o backend devolveria a lista SEM a visita
 * respondida. Reusar o mock cheio fazia a linha voltar assim que o refetch
 * chegava — a asserção só passava quando corria antes dele (verde na máquina,
 * vermelho no CI, que é mais lento).
 */
const listAfterAnswer = () => listMock([]);

const answerMock = (input: Record<string, unknown>) => ({
  request: {
    query: UPDATE_VISIT_ITEM_MUTATION,
    variables: { id: "v1", input },
  },
  result: {
    data: {
      updateVisitScheduleItem: {
        status: true,
        message: "ok",
        data: {
          __typename: "VisitScheduleItemType",
          id: "v1",
          status: "COMPLETED",
          outcome: null,
          notes: null,
          nextVisitSuggestion: null,
        },
      },
    },
  },
});

const renderOverdue = (mocks: Mocks, canAnswer = true) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks}>
        <OverdueVisits canAnswer={canAnswer} onAnswered={vi.fn()} />
      </MockedProvider>
    </Toast.ToastProvider>
  );

/** A fila só existe depois de abrir o painel pela faixa. */
const openPanel = async () =>
  userEvent.click(await screen.findByRole("button", { name: /Responder/ }));

describe("OverdueVisits", () => {
  it("não ocupa espaço quando não há visita sem resposta", async () => {
    renderOverdue([listMock([])]);
    // Cobrar nada é ruído na tela de trabalho: sem dívida, nada aparece.
    await waitFor(() => expect(screen.queryByText(/sem resposta/)).toBeNull());
    expect(screen.queryByRole("button")).toBeNull();
  });

  // O ponto da mudança de experiência: quem abre o dia vê a rota, não a fila
  // de cobrança. No fluxo da página fica só o aviso de uma linha.
  it("mostra só a faixa de aviso antes de abrir o painel", async () => {
    renderOverdue([listMock([VISIT])]);
    expect(
      await screen.findByText(/1 visita de dias que já passaram/)
    ).toBeInTheDocument();
    expect(screen.queryByText("Padaria do Zé LTDA")).not.toBeInTheDocument();
  });

  it("lista a visita vencida no painel, com o cliente e o dia da semana", async () => {
    renderOverdue([listMock([VISIT])]);
    await openPanel();

    expect(await screen.findByText("Padaria do Zé LTDA")).toBeInTheDocument();
    // 31/07/2026 foi uma sexta.
    expect(screen.getByText(/Sex.*31 Jul/)).toBeInTheDocument();
    expect(screen.getByText("1 em aberto")).toBeInTheDocument();
  });

  // O ponto da funcionalidade: a visita entra no histórico com a data em que
  // foi planejada, não com a data em que o vendedor respondeu.
  it("registra a visita na DATA PLANEJADA, não em hoje", async () => {
    const plannedIso = new Date(2026, 6, 31, 12).toISOString();
    renderOverdue([
      listMock([VISIT]),
      answerMock({ status: "COMPLETED", actualVisitAt: plannedIso }),
      listAfterAnswer(),
    ]);
    await openPanel();

    await userEvent.click(await screen.findByRole("button", { name: /Fui/ }));

    // Sem o mock casar (data errada), o Apollo devolve erro e a linha volta.
    await waitFor(() =>
      expect(screen.queryByText("Padaria do Zé LTDA")).not.toBeInTheDocument()
    );
  });

  it("não manda data de visita quando o cliente não estava", async () => {
    renderOverdue([listMock([VISIT]), answerMock({ status: "CLIENT_ABSENT" })]);
    await openPanel();

    await userEvent.click(
      await screen.findByRole("button", { name: /Não estava/ })
    );

    await waitFor(() =>
      expect(screen.queryByText("Padaria do Zé LTDA")).not.toBeInTheDocument()
    );
  });

  it("o gestor vê a dívida, mas o texto diz que quem responde é o vendedor", async () => {
    renderOverdue([listMock([VISIT])], false);
    expect(
      await screen.findByText(/Só o vendedor pode registrar/)
    ).toBeInTheDocument();
    // Sem poder responder, o convite da faixa deixa de ser "Responder".
    expect(
      screen.getByRole("button", { name: /Ver visitas/ })
    ).toBeInTheDocument();
  });
});
