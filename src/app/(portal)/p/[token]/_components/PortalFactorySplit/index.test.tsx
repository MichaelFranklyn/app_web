import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortalFactorySplit } from "./index";

const fabrica = (factoryName: string, amount: string, orderCount = 1) => ({
  factoryName,
  amount,
  orderCount,
});

const renderizar = (
  factories: ReturnType<typeof fabrica>[],
  totalAmount: string
) =>
  render(
    <PortalFactorySplit factories={factories} totalAmount={totalAmount} />
  );

/** A barra de proporção de cada fábrica, na ordem em que aparecem. */
const barras = () =>
  Array.from(document.querySelectorAll('[role="presentation"] > div')).map(
    (el) => (el as HTMLElement).style.width
  );

describe("PortalFactorySplit", () => {
  it("mostra nome, valor e fatia de cada fábrica", () => {
    renderizar(
      [
        fabrica("Fábrica Alfa", "3000.00", 2),
        fabrica("Fábrica Beta", "1000.00"),
      ],
      "4000.00"
    );

    expect(screen.getByText("Fábrica Alfa")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.000,00")).toBeInTheDocument();
    expect(screen.getByText("75% das compras · 2 pedidos")).toBeInTheDocument();
    expect(screen.getByText("25% das compras · 1 pedido")).toBeInTheDocument();
  });

  it("a barra tem o comprimento da fatia", () => {
    renderizar(
      [fabrica("Alfa", "3000.00"), fabrica("Beta", "1000.00")],
      "4000.00"
    );

    expect(barras()).toEqual(["75%", "25%"]);
  });

  it("fatia minúscula ainda aparece, em vez de sumir na borda", () => {
    renderizar(
      [fabrica("Alfa", "9990.00"), fabrica("Beta", "10.00")],
      "10000.00"
    );

    expect(barras()[1]).toBe("2%");
  });

  it("com uma fábrica só, o bloco some: barra de 100% não informa nada", () => {
    const { container } = renderizar([fabrica("Alfa", "4000.00")], "4000.00");

    expect(container).toBeEmptyDOMElement();
  });

  it("sem fábrica nenhuma, também não desenha nada", () => {
    const { container } = renderizar([], "0");

    expect(container).toBeEmptyDOMElement();
  });

  it("total zerado não vira divisão por zero na tela", () => {
    const { container } = renderizar(
      [fabrica("Alfa", "0.00"), fabrica("Beta", "0.00")],
      "0.00"
    );

    expect(container).toBeEmptyDOMElement();
  });
});
