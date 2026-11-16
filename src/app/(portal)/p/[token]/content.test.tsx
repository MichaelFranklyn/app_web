import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PortalContent } from "./content";
import { PortalPurchaseSummary } from "./interface";

// O gráfico baixa o echarts sob demanda e tem teste próprio; aqui só atrapalha.
vi.mock("./_components/PortalPurchaseChart", () => ({
  PortalPurchaseChart: () => <div data-testid="grafico" />,
}));

const TOKEN = "token-do-cliente";

// O jsdom não tem `matchMedia`; o cabeçalho com ação ("Pedidos") o consulta
// para empilhar os botões no celular.
beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
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
    <PortalContent profile={null} summary={resumo} token={TOKEN} {...props} />
  );

describe("PortalContent", () => {
  it("abre com o retrato das compras, sem repetir a lista de pedidos", () => {
    renderizar();

    expect(
      screen.getByRole("heading", { level: 1, name: "Resumo" })
    ).toBeInTheDocument();
    expect(screen.getByText("Total comprado")).toBeInTheDocument();
    expect(screen.queryByText("Seus pedidos")).not.toBeInTheDocument();
  });

  it("o cabeçalho leva aos pedidos", () => {
    renderizar();

    expect(
      screen.getByRole("link", { name: "Ver meus pedidos" })
    ).toHaveAttribute("href", `/p/${TOKEN}/enviados`);
  });

  it("cliente sem compra nenhuma vê o recado, não números zerados", () => {
    renderizar({ summary: { ...resumo, orderCount: 0 } });

    expect(screen.queryByText("Total comprado")).not.toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma compra por aqui ainda")
    ).toBeInTheDocument();
  });

  it("resumo que não chegou também cai no recado", () => {
    renderizar({ summary: null });

    expect(
      screen.getByText("Nenhuma compra por aqui ainda")
    ).toBeInTheDocument();
  });
});
