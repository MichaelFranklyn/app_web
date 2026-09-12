import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PortalOrder } from "../../interface";
import { PortalOrderCard } from "./index";

const TOKEN = "token-do-cliente";

const pedido = (overrides: Partial<PortalOrder> = {}): PortalOrder => ({
  id: "order-1",
  orderDate: "2026-08-01",
  factoryName: "Fábrica Alfa",
  totalAmount: "3000.0000",
  ipiAmount: "0.0000",
  status: "CONFIRMED",
  invoicedAt: null,
  deliveredAt: null,
  estimatedDeliveryDate: null,
  ...overrides,
});

const renderizar = (overrides: Partial<PortalOrder> = {}) =>
  render(<PortalOrderCard order={pedido(overrides)} token={TOKEN} />);

describe("PortalOrderCard", () => {
  it("o card INTEIRO é o link: no toque, alvo pequeno não se acerta", () => {
    renderizar();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/p/${TOKEN}/pedidos/order-1`);
    expect(link).toHaveTextContent("Fábrica Alfa");
    expect(link).toHaveTextContent("R$ 3.000,00");
  });

  it("pedido feito ainda não tem data de nota: mostra a do pedido", () => {
    renderizar({ status: "CONFIRMED" });

    expect(screen.getByText("Pedido em 01/08/2026")).toBeInTheDocument();
  });

  it("faturado com previsão mostra a previsão — é o que o cliente quer saber", () => {
    renderizar({
      status: "INVOICED",
      invoicedAt: "2026-08-05",
      estimatedDeliveryDate: "2026-08-20",
    });

    expect(
      screen.getByText("Previsão de entrega: 20/08/2026")
    ).toBeInTheDocument();
  });

  it("faturado sem previsão cai na data da nota", () => {
    renderizar({ status: "INVOICED", invoicedAt: "2026-08-05" });

    expect(screen.getByText("Nota emitida em 05/08/2026")).toBeInTheDocument();
  });

  it("entregue mostra a data da entrega", () => {
    renderizar({ status: "DELIVERED", deliveredAt: "2026-08-10" });

    expect(screen.getByText("Entregue em 10/08/2026")).toBeInTheDocument();
    expect(screen.getByText("Entregue")).toBeInTheDocument();
  });

  it("com IPI, o valor cheio vem acompanhado da conta que o compõe", () => {
    // Sem a linha de baixo, o cliente compara o total do card com o do pedido
    // que ele fez e acha que cobraram a mais.
    renderizar({ totalAmount: "3000.0000", ipiAmount: "150.0000" });

    expect(screen.getByText("R$ 3.150,00")).toBeInTheDocument();
    expect(
      screen.getByText("R$ 3.000,00 em mercadoria + R$ 150,00 de IPI")
    ).toBeInTheDocument();
  });

  it("sem IPI, não escreve a conta", () => {
    renderizar({ ipiAmount: "0.0000" });

    expect(screen.queryByText(/em mercadoria/)).not.toBeInTheDocument();
  });
});
