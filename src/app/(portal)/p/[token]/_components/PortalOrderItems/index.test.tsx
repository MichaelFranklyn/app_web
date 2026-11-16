import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortalOrderItem } from "../../interface";
import { PortalOrderItems } from "./index";

const item = (overrides: Partial<PortalOrderItem> = {}): PortalOrderItem => ({
  id: "item-1",
  productName: "Torneira de mesa bica alta",
  sku: "SKU-1",
  quantity: "12.0000",
  unitPrice: "250.0000",
  subtotal: "3000.0000",
  ipiAmount: "0.0000",
  ipiRate: "0.0000",
  taxAmount: "0.0000",
  unitPriceWithTax: "250.0000",
  ...overrides,
});

describe("PortalOrderItems", () => {
  it("mostra produto, código, quantidade, preço e o total da linha", () => {
    // É o bloco que o cliente lê conferindo, item a item, contra a nota.
    render(<PortalOrderItems items={[item()]} />);

    expect(screen.getByText("Torneira de mesa bica alta")).toBeInTheDocument();
    expect(screen.getByText("Código SKU-1")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    // Sem imposto, preço sem e com imposto coincidem.
    expect(screen.getAllByText("R$ 250,00")).toHaveLength(2);
    expect(screen.getByText("R$ 3.000,00")).toBeInTheDocument();
  });

  it("conta os produtos no título, no singular e no plural", () => {
    const { rerender } = render(<PortalOrderItems items={[item()]} />);
    expect(screen.getByText("1 produto")).toBeInTheDocument();

    rerender(<PortalOrderItems items={[item(), item({ id: "item-2" })]} />);
    expect(screen.getByText("2 produtos")).toBeInTheDocument();
  });

  it("diz em que unidade a quantidade está", () => {
    // A tabela de preço é por embalagem, mas o PEDIDO é por unidade — sem a
    // frase, o cliente confere 12 caixas contra 12 peças.
    render(<PortalOrderItems items={[item()]} />);

    expect(screen.getByText("Quantidades em unidades.")).toBeInTheDocument();
  });

  it("o pedido enviado troca a linha de baixo do título", () => {
    render(
      <PortalOrderItems
        items={[item()]}
        description="Quantidades em unidades; preços estimados pela sua tabela."
      />
    );

    expect(
      screen.getByText(
        "Quantidades em unidades; preços estimados pela sua tabela."
      )
    ).toBeInTheDocument();
  });

  it("produto sem código não deixa a linha 'Código' vazia", () => {
    render(<PortalOrderItems items={[item({ sku: null })]} />);

    expect(screen.queryByText(/^Código/)).not.toBeInTheDocument();
  });

  it("como no sistema: subtotal soma o imposto embutido, sem o IPI", () => {
    render(
      <PortalOrderItems
        items={[
          item({
            unitPriceWithTax: "270.0000",
            taxAmount: "240.0000",
            ipiRate: "5.0000",
            ipiAmount: "150.0000",
          }),
        ]}
      />
    );

    expect(screen.getByText("Preço sem imposto")).toBeInTheDocument();
    expect(screen.getByText("R$ 270,00")).toBeInTheDocument();
    // IPI: alíquota e valor; Imposto: o valor embutido.
    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(screen.getByText("R$ 150,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 240,00")).toBeInTheDocument();
    expect(screen.getByText("Subtotal (sem IPI)")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.240,00")).toBeInTheDocument();
  });

  it("sem IPI nem imposto, as duas colunas não aparecem", () => {
    render(<PortalOrderItems items={[item()]} />);

    expect(screen.queryByText("IPI")).not.toBeInTheDocument();
    expect(screen.queryByText("Imposto")).not.toBeInTheDocument();
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
  });

  it("sem item nenhum, o bloco não aparece", () => {
    const { container } = render(<PortalOrderItems items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
