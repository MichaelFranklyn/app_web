import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortalOrderDetail } from "../../interface";
import { PortalOrderContent } from "./content";

const TOKEN = "token-do-cliente";

const pedido = (
  overrides: Partial<PortalOrderDetail> = {}
): PortalOrderDetail => ({
  id: "order-1",
  orderDate: "2026-08-01",
  factoryName: "Fábrica Alfa",
  totalAmount: "3000.0000",
  ipiAmount: "0.0000",
  status: "DELIVERED",
  invoicedAt: "2026-08-05",
  deliveredAt: "2026-08-10",
  estimatedDeliveryDate: null,
  paymentTermName: "30/60",
  items: [
    {
      id: "item-1",
      productName: "Torneira Teste",
      sku: "SKU-1",
      quantity: "12.0000",
      unitPrice: "250.0000",
      subtotal: "3000.0000",
      ipiAmount: "0.0000",
    },
  ],
  installments: [
    {
      sequence: 1,
      amount: "3000.0000",
      dueDate: "2026-09-05",
      status: "PENDING",
      paidAt: null,
    },
  ],
  ...overrides,
});

const renderizar = (overrides: Partial<PortalOrderDetail> = {}) =>
  render(<PortalOrderContent order={pedido(overrides)} token={TOKEN} />);

describe("PortalOrderContent", () => {
  it("identifica a compra: fábrica, valor, situação e data", () => {
    renderizar();

    expect(
      screen.getByRole("heading", { name: "Fábrica Alfa" })
    ).toBeInTheDocument();
    // O mesmo valor aparece no total do pedido, no item e na parcela.
    expect(screen.getAllByText("R$ 3.000,00").length).toBeGreaterThan(0);
    expect(screen.getByText("Entregue")).toBeInTheDocument();
    expect(screen.getByText("Entregue em 10/08/2026")).toBeInTheDocument();
  });

  it("traz de volta para a lista de compras", () => {
    renderizar();

    expect(
      screen.getByRole("link", { name: /Minhas compras/ })
    ).toHaveAttribute("href", `/p/${TOKEN}`);
  });

  it("mostra a condição de pagamento quando o pedido tem uma", () => {
    renderizar();

    expect(
      screen.getByText("Condição de pagamento: 30/60")
    ).toBeInTheDocument();
  });

  it("sem condição cadastrada, não escreve a linha vazia", () => {
    renderizar({ paymentTermName: null });

    expect(screen.queryByText(/Condição de pagamento/)).not.toBeInTheDocument();
  });

  it("com IPI, o total vem com a conta que o compõe", () => {
    renderizar({ ipiAmount: "150.0000" });

    expect(screen.getByText("R$ 3.150,00")).toBeInTheDocument();
    expect(
      screen.getByText("R$ 3.000,00 em mercadoria + R$ 150,00 de IPI")
    ).toBeInTheDocument();
  });

  it("desenha os itens e as parcelas do pedido", () => {
    renderizar();

    expect(screen.getByText("Torneira Teste")).toBeInTheDocument();
    expect(screen.getByText("1ª · vence 05/09/2026")).toBeInTheDocument();
  });

  it("pedido recém-feito sai sem o bloco de pagamento", () => {
    // É o faturamento que gera as parcelas — cedo demais, não erro.
    renderizar({ status: "CONFIRMED", installments: [], invoicedAt: null });

    expect(
      screen.queryByRole("heading", { name: "Pagamento" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Pedido em 01/08/2026")).toBeInTheDocument();
  });
});
