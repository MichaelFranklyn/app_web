import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { UPDATE_VISIT_ITEM_MUTATION } from "../../gql";
import { OverdueVisitsCard } from "./index";
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

const listMock = (visits: unknown[]) => ({
  request: { query: OVERDUE_VISITS_QUERY, variables: { sellerId: null } },
  result: { data: { overdueVisits: visits } },
  maxUsageCount: 5,
});

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

const renderCard = (mocks: Mocks, canAnswer = true) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks}>
        <OverdueVisitsCard canAnswer={canAnswer} onAnswered={vi.fn()} />
      </MockedProvider>
    </Toast.ToastProvider>
  );

describe("OverdueVisitsCard", () => {
  it("não ocupa espaço quando não há visita sem resposta", async () => {
    renderCard([listMock([])]);
    // Cobrar nada é ruído na tela de trabalho: sem dívida, o card não existe.
    await waitFor(() =>
      expect(screen.queryByText(/O que aconteceu nestas visitas/)).toBeNull()
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("lista a visita vencida com o cliente e o dia da semana", async () => {
    renderCard([listMock([VISIT])]);
    expect(await screen.findByText("Padaria do Zé LTDA")).toBeInTheDocument();
    // 31/07/2026 foi uma sexta.
    expect(screen.getByText(/Sex.*31 Jul/)).toBeInTheDocument();
    expect(screen.getByText("1 sem resposta")).toBeInTheDocument();
  });

  // O ponto da funcionalidade: a visita entra no histórico com a data em que
  // foi planejada, não com a data em que o vendedor respondeu.
  it("registra a visita na DATA PLANEJADA, não em hoje", async () => {
    const plannedIso = new Date(2026, 6, 31, 12).toISOString();
    renderCard([
      listMock([VISIT]),
      answerMock({ status: "COMPLETED", actualVisitAt: plannedIso }),
    ]);

    await userEvent.click(await screen.findByRole("button", { name: /Fui/ }));

    // Sem o mock casar (data errada), o Apollo devolve erro e a linha volta.
    await waitFor(() =>
      expect(screen.queryByText("Padaria do Zé LTDA")).not.toBeInTheDocument()
    );
  });

  it("não manda data de visita quando o cliente não estava", async () => {
    renderCard([listMock([VISIT]), answerMock({ status: "CLIENT_ABSENT" })]);

    await userEvent.click(
      await screen.findByRole("button", { name: /Não estava/ })
    );

    await waitFor(() =>
      expect(screen.queryByText("Padaria do Zé LTDA")).not.toBeInTheDocument()
    );
  });

  it("o gestor vê a dívida, mas o texto diz que quem responde é o vendedor", async () => {
    renderCard([listMock([VISIT])], false);
    expect(
      await screen.findByText(/Só o vendedor pode registrar/)
    ).toBeInTheDocument();
  });
});
