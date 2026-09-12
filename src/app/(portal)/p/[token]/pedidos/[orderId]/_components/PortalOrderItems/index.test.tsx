import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortalOrderItem } from "../../../../interface";
import { PortalOrderItems } from "./index";

const item = (overrides: Partial<PortalOrderItem> = {}): PortalOrderItem => ({
  id: "item-1",
  productName: "Torneira de mesa bica alta",
  sku: "SKU-1",
  quantity: "12.0000",
  unitPrice: "250.0000",
  subtotal: "3000.0000",
  ipiAmount: "0.0000",
  ...overrides,
});

describe("PortalOrderItems", () => {
  it("mostra produto, código, quantidade × preço e o total da linha", () => {
    // É o bloco que o cliente lê conferindo, item a item, contra a nota.
    render(<PortalOrderItems items={[item()]} />);

    expect(screen.getByText("Torneira de mesa bica alta")).toBeInTheDocument();
    expect(screen.getByText("Código SKU-1")).toBeInTheDocument();
    expect(screen.getByText("12 × R$ 250,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.000,00")).toBeInTheDocument();
  });

  it("conta os itens no título, no singular e no plural", () => {
    const { rerender } = render(<PortalOrderItems items={[item()]} />);
    expect(screen.getByText("1 item")).toBeInTheDocument();

    rerender(<PortalOrderItems items={[item(), item({ id: "item-2" })]} />);
    expect(screen.getByText("2 itens")).toBeInTheDocument();
  });

  it("diz em que unidade a quantidade está", () => {
    // A tabela de preço é por embalagem, mas o PEDIDO é por unidade — sem a
    // frase, o cliente confere 12 caixas contra 12 peças.
    render(<PortalOrderItems items={[item()]} />);

    expect(screen.getByText("Quantidades em unidades.")).toBeInTheDocument();
  });

  it("produto sem código não deixa a linha 'Código' vazia", () => {
    render(<PortalOrderItems items={[item({ sku: null })]} />);

    expect(screen.queryByText(/^Código/)).not.toBeInTheDocument();
  });

  it("o total da linha soma o IPI do item", () => {
    render(
      <PortalOrderItems
        items={[item({ subtotal: "3000.0000", ipiAmount: "150.0000" })]}
      />
    );

    expect(screen.getByText("R$ 3.150,00")).toBeInTheDocument();
  });

  it("sem item nenhum, o bloco não aparece", () => {
    const { container } = render(<PortalOrderItems items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
