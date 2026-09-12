import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PortalContent } from "./content";
import { PortalOrder, PortalPurchaseSummary } from "./interface";

// O gráfico baixa o echarts sob demanda e tem teste próprio; aqui só atrapalha.
vi.mock("./_components/PortalPurchaseChart", () => ({
  PortalPurchaseChart: () => <div data-testid="grafico" />,
}));

const TOKEN = "token-do-cliente";

const pedido = (overrides: Partial<PortalOrder> = {}): PortalOrder => ({
  id: "order-1",
  orderDate: "2026-08-01",
  factoryName: "Fábrica Alfa",
  totalAmount: "3000.0000",
  ipiAmount: "0.0000",
  status: "DELIVERED",
  invoicedAt: "2026-08-05",
  deliveredAt: "2026-08-10",
  estimatedDeliveryDate: null,
  ...overrides,
});

const resumo: PortalPurchaseSummary = {
  totalAmount: "5000.0000",
  orderCount: 2,
  averageTicket: "2500.0000",
  months: [],
  factories: [],
};

const renderizar = (props: Partial<Parameters<typeof PortalContent>[0]> = {}) =>
  render(
    <PortalContent
      summary={resumo}
      orders={[pedido()]}
      totalCount={1}
      hasNextPage={false}
      page={1}
      token={TOKEN}
      {...props}
    />
  );

describe("PortalContent", () => {
  it("abre com o retrato das compras e a lista de pedidos", () => {
    renderizar();

    expect(screen.getByText("Total comprado")).toBeInTheDocument();
    expect(screen.getByText("Seus pedidos")).toBeInTheDocument();
    expect(screen.getByText("Fábrica Alfa")).toBeInTheDocument();
  });

  it("conta os pedidos e convida ao toque quando há o que abrir", () => {
    renderizar({ totalCount: 8, orders: [pedido()] });

    expect(
      screen.getByText("8 pedidos registrados · toque para ver os itens")
    ).toBeInTheDocument();
  });

  it("um pedido só é dito no singular", () => {
    renderizar({ totalCount: 1 });

    expect(screen.getByText(/^1 pedido registrado/)).toBeInTheDocument();
  });

  it("o resumo só aparece na primeira página", () => {
    // Navegando para trás no histórico, o gráfico dos últimos 12 meses
    // continuaria igual e roubaria a tela dos pedidos que o cliente foi buscar.
    renderizar({ page: 2 });

    expect(screen.queryByText("Total comprado")).not.toBeInTheDocument();
    expect(screen.getByText("Seus pedidos")).toBeInTheDocument();
  });

  it("cliente sem compra nenhuma não vê resumo", () => {
    renderizar({ summary: null, orders: [], totalCount: 0 });

    expect(screen.queryByText("Total comprado")).not.toBeInTheDocument();
  });

  it("lista vazia na primeira página fala de quem nunca comprou", () => {
    renderizar({ orders: [], totalCount: 0, summary: null });

    expect(
      screen.queryByText(/toque para ver os itens/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Você chegou ao fim da lista")
    ).not.toBeInTheDocument();
  });

  it("lista vazia numa página adiante diz que a lista acabou", () => {
    // Dizer "nenhum pedido por aqui" a um cliente que tem oito é o que faz ele
    // ligar para o vendedor achando que sumiu tudo.
    renderizar({ orders: [], totalCount: 8, page: 3 });

    expect(screen.getByText("Você chegou ao fim da lista")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar para os pedidos recentes" })
    ).toHaveAttribute("href", `/p/${TOKEN}`);
  });

  it("com mais páginas, oferece os mais antigos", () => {
    renderizar({ hasNextPage: true });

    expect(screen.getByRole("link", { name: /Mais antigos/ })).toHaveAttribute(
      "href",
      `/p/${TOKEN}?p=2`
    );
  });

  it("voltar da segunda para a primeira página cai na URL sem parâmetro", () => {
    renderizar({ page: 2 });

    expect(screen.getByRole("link", { name: /Mais recentes/ })).toHaveAttribute(
      "href",
      `/p/${TOKEN}`
    );
  });

  it("página única não desenha navegação nenhuma", () => {
    renderizar({ page: 1, hasNextPage: false });

    expect(
      screen.queryByRole("link", { name: /Mais antigos/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Mais recentes/ })
    ).not.toBeInTheDocument();
  });
});
