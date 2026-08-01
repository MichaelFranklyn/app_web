import { Toast } from "@/components/Toast";
import { MockedProvider } from "@apollo/client/testing/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { PROMOTE_CONTACT_MUTATION, VISIT_PROMOTION_PREVIEW_QUERY } from "./gql";
import { PromoteContactModal } from "./index";

type Mocks = ComponentProps<typeof MockedProvider>["mocks"];

const CLIENT = {
  id: "c1",
  razaoSocial: "Joni Materiais de Construção LTDA",
  nomeFantasia: "Joni Materiais",
  companyClient: null,
  primaryContact: null,
};

const NEARBY = {
  __typename: "NearbyVisitCandidateType",
  sellerClientFactoryId: "link-9",
  distanceKm: 12.4,
  scoreTotal: "68.0",
  isUrgent: true,
  client: {
    __typename: "ClientType",
    id: "c9",
    razaoSocial: "Depósito Central LTDA",
    nomeFantasia: "Depósito Central",
    addressCity: "Feira de Santana",
    addressState: "BA",
  },
  factory: {
    __typename: "FactoryType",
    id: "f9",
    razaoSocial: "Fábrica Nove LTDA",
    nomeFantasia: "Fábrica Nove",
  },
};

const previewMock = (overrides: Record<string, unknown> = {}) => ({
  request: {
    query: VISIT_PROMOTION_PREVIEW_QUERY,
    variables: { itemId: "item-1", targetDate: null },
  },
  result: {
    data: {
      visitPromotionPreview: {
        __typename: "VisitPromotionPreviewType",
        isReachable: true,
        fitsWithExisting: false,
        occupiesWholeDay: true,
        travelMinOneWay: 161,
        distanceKm: 101.5,
        displacedCount: 4,
        nearby: [NEARBY],
        ...overrides,
      },
    },
  },
});

const promoteMock = (input: Record<string, unknown>) => ({
  request: { query: PROMOTE_CONTACT_MUTATION, variables: { input } },
  result: {
    data: { promoteContactToVisit: { status: true, message: "ok" } },
  },
});

const renderModal = (mocks: Mocks, onDone = vi.fn()) =>
  render(
    <Toast.ToastProvider>
      <MockedProvider mocks={mocks}>
        <PromoteContactModal
          itemId="item-1"
          client={CLIENT}
          currentDate="2026-08-05"
          open
          onOpenChange={vi.fn()}
          onDone={onDone}
        />
      </MockedProvider>
    </Toast.ToastProvider>
  );

describe("PromoteContactModal", () => {
  it("mostra o custo da viagem em km e horas", async () => {
    renderModal([previewMock()]);
    expect(await screen.findByText(/102 km de distância/)).toBeInTheDocument();
    expect(screen.getByText(/2h41 de viagem/)).toBeInTheDocument();
  });

  it("avisa que a viagem toma o dia e cita quantas visitas saem", async () => {
    renderModal([previewMock()]);
    expect(await screen.findByText(/toma o dia inteiro/)).toBeInTheDocument();
    expect(screen.getByText(/4 visitas marcada/)).toBeInTheDocument();
  });

  it("distingue a viagem que nem cabe num dia", async () => {
    renderModal([previewMock({ isReachable: false, occupiesWholeDay: false })]);
    expect(
      await screen.findByText(/não dá para ir, atender e voltar/)
    ).toBeInTheDocument();
  });

  // A caixa é a trava: sem ela, a viagem longa entraria com um clique só.
  it("só libera o botão depois da confirmação", async () => {
    renderModal([previewMock()]);
    await screen.findByText(/102 km de distância/);
    const botao = screen.getByRole("button", { name: /Marcar visita/ });
    expect(botao).toBeDisabled();

    await userEvent.click(
      screen.getByText(/quero marcar esta visita mesmo assim/i)
    );
    expect(botao).toBeEnabled();
  });

  it("não pede confirmação quando a visita cabe no dia", async () => {
    renderModal([
      previewMock({
        fitsWithExisting: true,
        occupiesWholeDay: false,
        displacedCount: 0,
      }),
    ]);
    await screen.findByText(/102 km de distância/);
    expect(screen.getByRole("button", { name: /Marcar visita/ })).toBeEnabled();
    expect(screen.queryByText(/mesmo assim/)).toBeNull();
  });

  it("lista o vizinho da região com a faixa de score e a distância", async () => {
    renderModal([previewMock()]);
    expect(
      await screen.findByText("Depósito Central LTDA")
    ).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
    expect(screen.getByText(/12 km daqui/)).toBeInTheDocument();
  });

  it("envia a estratégia escolhida e os vizinhos marcados", async () => {
    const onDone = vi.fn();
    renderModal(
      [
        previewMock(),
        promoteMock({
          itemId: "item-1",
          confirmWholeDay: true,
          displacedStrategy: "NEXT_DAYS",
          includeLinkIds: ["link-9"],
        }),
      ],
      onDone
    );

    await screen.findByText(/102 km de distância/);
    await userEvent.click(
      screen.getByText(/quero marcar esta visita mesmo assim/i)
    );
    await userEvent.click(screen.getByText(/Empurrar para os próximos dias/i));
    await userEvent.click(
      screen.getByRole("checkbox", { name: /Visitar também Depósito Central/i })
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Marcar visita/ })
    );

    // Sem o mock casar (estratégia/vizinho errados) a mutation erra e onDone
    // nunca roda.
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("avisa quando não há ninguém por perto para aproveitar a viagem", async () => {
    renderModal([previewMock({ nearby: [] })]);
    expect(
      await screen.findByText(/Não há outros clientes seus por perto/)
    ).toBeInTheDocument();
  });
});

describe("PromoteContactModal · dia da viagem", () => {
  const otherDayMock = () => ({
    request: {
      query: VISIT_PROMOTION_PREVIEW_QUERY,
      variables: { itemId: "item-1", targetDate: "2026-08-06" },
    },
    result: {
      data: {
        visitPromotionPreview: {
          __typename: "VisitPromotionPreviewType",
          isReachable: true,
          // Dia vazio: a mesma viagem deixa de expulsar alguém.
          fitsWithExisting: true,
          occupiesWholeDay: false,
          travelMinOneWay: 161,
          distanceKm: 101.5,
          displacedCount: 0,
          nearby: [],
        },
      },
    },
  });

  it("mostra o dia em que o contato já está", async () => {
    renderModal([previewMock()]);
    expect(await screen.findByText(/Qua.*05 Ago/)).toBeInTheDocument();
  });

  it("refaz a conta ao escolher outro dia e some com o aviso", async () => {
    renderModal([previewMock(), otherDayMock()]);
    expect(await screen.findByText(/toma o dia inteiro/)).toBeInTheDocument();

    // O input é readOnly (pointer-events-none): quem abre o calendário é o
    // container, como no teste do próprio InputDate.
    const campo = screen.getByRole("textbox");
    fireEvent.click(campo.parentElement as HTMLElement);
    // "6" e "16"/"26" casam no mesmo texto: o dia exato vem do rótulo completo.
    await userEvent.click(
      screen.getByRole("button", { name: "quinta-feira, 6 de agosto de 2026" })
    );

    await waitFor(() =>
      expect(screen.queryByText(/toma o dia inteiro/)).toBeNull()
    );
    expect(screen.getByRole("button", { name: /Marcar visita/ })).toBeEnabled();
  });
});
