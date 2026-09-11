import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PortalPurchaseSummary } from "../../interface";
import { PortalSummary } from "./index";

// O gráfico baixa o echarts sob demanda e tem teste próprio (utils do option).
// Aqui interessa a MOLDURA: os três números antes dele e a divisão por fábrica.
vi.mock("../PortalPurchaseChart", () => ({
  PortalPurchaseChart: () => <div data-testid="grafico" />,
}));

const resumo = (
  overrides: Partial<PortalPurchaseSummary> = {}
): PortalPurchaseSummary => ({
  totalAmount: "5000.0000",
  orderCount: 2,
  averageTicket: "2500.0000",
  months: [{ month: "2026-08-01", amount: "3000.0000", orderCount: 1 }],
  factories: [
    { factoryName: "Fábrica Alfa", amount: "3000.0000", orderCount: 1 },
    { factoryName: "Fábrica Beta", amount: "2000.0000", orderCount: 1 },
  ],
  ...overrides,
});

describe("PortalSummary", () => {
  it("responde 'quanto eu já comprei aqui' com três números", () => {
    render(<PortalSummary summary={resumo()} />);

    expect(screen.getByText("Total comprado")).toBeInTheDocument();
    expect(screen.getByText("R$ 5.000,00")).toBeInTheDocument();
    expect(screen.getByText("Pedidos")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Média por pedido")).toBeInTheDocument();
    expect(screen.getByText("R$ 2.500,00")).toBeInTheDocument();
  });

  it("o gráfico vem depois dos números, e diz o recorte que cobre", () => {
    render(<PortalSummary summary={resumo()} />);

    expect(screen.getByText("Compras por mês")).toBeInTheDocument();
    expect(
      screen.getByText("Últimos 12 meses, incluindo os meses sem compra.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("grafico")).toBeInTheDocument();
  });

  it("com duas fábricas, mostra a divisão entre elas", () => {
    render(<PortalSummary summary={resumo()} />);

    expect(screen.getByText("Compras por fábrica")).toBeInTheDocument();
  });

  it("com uma fábrica só, a divisão some e o resto fica", () => {
    render(
      <PortalSummary
        summary={resumo({
          factories: [
            { factoryName: "Fábrica Alfa", amount: "5000.0000", orderCount: 2 },
          ],
        })}
      />
    );

    expect(screen.queryByText("Compras por fábrica")).not.toBeInTheDocument();
    expect(screen.getByText("Total comprado")).toBeInTheDocument();
  });

  it("cliente sem nenhuma compra não vê retrato de compra nenhuma", () => {
    const { container } = render(
      <PortalSummary summary={resumo({ orderCount: 0 })} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
