import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PortalOrderDetail } from "../../interface";
import { PortalOrderContent } from "./content";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock("./actions", () => ({
  confirmPortalOrderDeliveryAction: vi.fn(),
}));

const TOKEN = "token-do-cliente";

// O jsdom não tem `matchMedia`; o cabeçalho com ação ("voltar") o consulta
// para empilhar os botões no celular.
beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

const pedido = (
  overrides: Partial<PortalOrderDetail> = {}
): PortalOrderDetail => ({
  id: "order-1",
  number: 428,
  taxAmount: "0.0000",
  freightType: "cif",
  orderDate: "2026-08-01",
  factoryName: "Fábrica Alfa",
  totalAmount: "3000.0000",
  ipiAmount: "0.0000",
  status: "DELIVERED",
  invoicedAt: "2026-08-05",
  deliveredAt: "2026-08-10",
  estimatedDeliveryDate: null,
  paymentTermName: "30/60",
  sellerName: "Ana",
  sellerEmail: "ana@example.com",
  sellerPhone: "11999990000",
  items: [
    {
      id: "item-1",
      productName: "Torneira Teste",
      sku: "SKU-1",
      quantity: "12.0000",
      unitPrice: "250.0000",
      subtotal: "3000.0000",
      ipiAmount: "0.0000",
      ipiRate: "0.0000",
      taxAmount: "0.0000",
      unitPriceWithTax: "250.0000",
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
  render(
    <PortalOrderContent
      order={pedido(overrides)}
      token={TOKEN}
      brand={{ companyName: "Escritório", companyLogoUrl: null }}
    />
  );

describe("PortalOrderContent", () => {
  it("identifica a compra: número, fábrica, valor, situação e data", () => {
    renderizar();

    // Como no sistema: "Pedido #428" no título, a fábrica na descrição.
    expect(
      screen.getByRole("heading", { name: "Pedido #428" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fábrica Alfa · Entregue em 10/08/2026")
    ).toBeInTheDocument();
    // O mesmo valor aparece no total do pedido, no item e na parcela.
    expect(screen.getAllByText("R$ 3.000,00").length).toBeGreaterThan(0);
    expect(screen.getByText("Entregue")).toBeInTheDocument();
  });

  it("o breadcrumb volta para a lista de pedidos", () => {
    renderizar();

    expect(screen.getByRole("link", { name: "Pedidos" })).toHaveAttribute(
      "href",
      `/p/${TOKEN}/enviados`
    );
  });

  it("o resumo financeiro traz prazo e frete, como no sistema", () => {
    renderizar();

    expect(screen.getByText("Resumo financeiro")).toBeInTheDocument();
    expect(screen.getByText("Prazo de pagamento")).toBeInTheDocument();
    expect(screen.getByText("30/60")).toBeInTheDocument();
    expect(screen.getByText("CIF — entrega pela fábrica")).toBeInTheDocument();
  });

  it("sem prazo cadastrado, a linha mostra um traço", () => {
    renderizar({ paymentTermName: null, freightType: null });

    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("nunca mostra a comissão", () => {
    renderizar();

    expect(screen.queryByText(/Comiss/)).not.toBeInTheDocument();
  });

  it("com imposto e IPI, o resumo abre a conta do total", () => {
    renderizar({ taxAmount: "240.0000", ipiAmount: "150.0000" });

    expect(screen.getByText("Mercadoria (sem impostos)")).toBeInTheDocument();
    expect(screen.getByText("Impostos no preço")).toBeInTheDocument();
    expect(screen.getByText("R$ 240,00")).toBeInTheDocument();
    expect(screen.getByText("Subtotal (sem IPI)")).toBeInTheDocument();
    expect(screen.getByText("R$ 3.240,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 150,00")).toBeInTheDocument();
    // Total = mercadoria + imposto + IPI.
    expect(screen.getByText("R$ 3.390,00")).toBeInTheDocument();
  });

  it("sem imposto nem IPI, o resumo não repete o total em outras linhas", () => {
    renderizar();

    expect(screen.queryByText("Impostos no preço")).not.toBeInTheDocument();
    expect(screen.queryByText("IPI")).not.toBeInTheDocument();
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
    expect(
      screen.getByText("Fábrica Alfa · Pedido em 01/08/2026")
    ).toBeInTheDocument();
  });

  it("traz baixar PDF, email e WhatsApp do pedido", () => {
    renderizar();

    expect(
      screen.getByRole("button", { name: /Baixar PDF/ })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /email/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /WhatsApp/i }).length
    ).toBeGreaterThan(0);
  });

  it("confirmar entrega só no pedido faturado que ainda não chegou", () => {
    renderizar({ status: "INVOICED", deliveredAt: null });
    expect(
      screen.getByRole("button", { name: /Confirmar entrega/ })
    ).toBeInTheDocument();
  });

  it("pedido entregue não oferece confirmar entrega", () => {
    renderizar();
    expect(
      screen.queryByRole("button", { name: /Confirmar entrega/ })
    ).not.toBeInTheDocument();
  });
});
