import { describe, expect, it } from "vitest";
import { PortalOrderDetail } from "../../interface";
import {
  canConfirmDelivery,
  portalOrderFileName,
  portalOrderMailSubject,
  portalOrderPdfContext,
  portalOrderShareText,
} from "./utils";

const pedido = (
  overrides: Partial<PortalOrderDetail> = {}
): PortalOrderDetail => ({
  id: "order-1",
  number: 428,
  taxAmount: "100.0000",
  freightType: "cif",
  orderDate: "2026-08-01",
  factoryName: "Fábrica São João",
  totalAmount: "1000.0000",
  ipiAmount: "50.0000",
  status: "INVOICED",
  invoicedAt: "2026-08-05",
  deliveredAt: null,
  estimatedDeliveryDate: null,
  paymentTermName: "30/60",
  sellerName: "Ana",
  sellerEmail: "ana@example.com",
  sellerPhone: null,
  items: [
    {
      id: "i1",
      productName: "Torneira",
      sku: "T-1",
      quantity: "4.0000",
      unitPrice: "250.0000",
      subtotal: "1000.0000",
      ipiAmount: "50.0000",
      ipiRate: "5.0000",
      taxAmount: "100.0000",
      unitPriceWithTax: "275.0000",
    },
  ],
  installments: [],
  ...overrides,
});

describe("utilitários do pedido feito", () => {
  it("confirmar entrega: só faturado e sem data de entrega", () => {
    expect(canConfirmDelivery(pedido())).toBe(true);
    expect(canConfirmDelivery(pedido({ status: "CONFIRMED" }))).toBe(false);
    expect(
      canConfirmDelivery(
        pedido({ status: "DELIVERED", deliveredAt: "2026-08-10" })
      )
    ).toBe(false);
    expect(canConfirmDelivery(pedido({ deliveredAt: "2026-08-10" }))).toBe(
      false
    );
  });

  it("o texto do email/WhatsApp leva número, itens e o total com impostos", () => {
    const text = portalOrderShareText(pedido());
    expect(text).toContain("Olá, Ana! Sobre o pedido #428:");
    expect(text).toContain("• 4 × Torneira (T-1)");
    expect(text.replace(/\u00a0/g, " ")).toContain("Total: R$ 1.150,00");
  });

  it("o PDF não fala em valor estimado nem em comissão", () => {
    const lines = portalOrderPdfContext(pedido()).join(" ");
    expect(lines).toContain("Fábrica: Fábrica São João");
    expect(lines).toContain("Prazo: 30/60");
    expect(lines).toContain("Representante: Ana");
    expect(lines).not.toMatch(/estimad|comiss/i);
  });

  it("assunto e nome do arquivo", () => {
    expect(portalOrderMailSubject(pedido())).toBe(
      "Pedido #428 — Fábrica São João"
    );
    expect(portalOrderFileName(pedido())).toBe(
      "pedido-428-fabrica-sao-joao.pdf"
    );
  });
});
