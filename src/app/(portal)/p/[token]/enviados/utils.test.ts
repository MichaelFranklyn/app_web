import { describe, expect, it } from "vitest";
import { PortalSentOrderDetail } from "../interface";
import {
  formatBrtDate,
  sentOrderFileName,
  parseSentOrdersTab,
  sentOrderNumberLine,
  sentOrdersPageCount,
  sentOrderHint,
  sentOrderHref,
  sentOrderMailSubject,
  sentOrderShareText,
  sentOrderStage,
  sentOrderTotal,
  sentOrdersHref,
  sentOrdersKind,
} from "./utils";

const order = (
  overrides: Partial<PortalSentOrderDetail> = {}
): PortalSentOrderDetail => ({
  id: "sent-1",
  createdAt: "2026-11-10T13:30:00+00:00",
  factoryName: "Fábrica Alfa",
  status: "DRAFT",
  totalAmount: "480.0000",
  ipiAmount: "20.0000",
  itemCount: 1,
  seenBySellerAt: null,
  clientRequestNote: null,
  sellerName: "Rafael",
  sellerEmail: "rafael@exemplo.com",
  sellerPhone: "71988887777",
  number: 12,
  taxAmount: "0.0000",
  items: [
    {
      id: "i-1",
      productName: "Torneira",
      sku: "SKU-1",
      quantity: "24.0000",
      unitPrice: "20.0000",
      subtotal: "480.0000",
      ipiAmount: "20.0000",
      ipiRate: "4.1667",
      taxAmount: "0.0000",
      unitPriceWithTax: "20.0000",
    },
  ],
  ...overrides,
});

describe("sentOrderStage", () => {
  it("rascunho e enviado são 'aguardando' até o vendedor marcar que viu", () => {
    expect(sentOrderStage(order())).toBe("waiting");
    expect(sentOrderStage(order({ status: "SENT" }))).toBe("waiting");
    expect(
      sentOrderStage(order({ seenBySellerAt: "2026-11-11T12:00:00+00:00" }))
    ).toBe("seen");
  });

  it("confirmado em diante é 'virou pedido'; cancelado vence o visto", () => {
    for (const status of ["CONFIRMED", "INVOICED", "DELIVERED"] as const) {
      expect(sentOrderStage(order({ status }))).toBe("ordered");
    }
    expect(
      sentOrderStage(
        order({ status: "CANCELLED", seenBySellerAt: "2026-11-11T12:00:00Z" })
      )
    ).toBe("cancelled");
  });
});

describe("formatBrtDate", () => {
  it("usa o fuso de Brasília: 01h UTC ainda é o dia anterior", () => {
    expect(formatBrtDate("2026-11-11T01:00:00+00:00")).toBe("10/11/2026");
  });

  it("vazio ou inválido vira texto vazio", () => {
    expect(formatBrtDate(null)).toBe("");
    expect(formatBrtDate("não é data")).toBe("");
  });
});

describe("sentOrderHint", () => {
  it("diz quando o vendedor viu", () => {
    expect(
      sentOrderHint(order({ seenBySellerAt: "2026-11-11T12:00:00+00:00" }))
    ).toContain("Rafael viu o seu pedido em 11/11/2026");
  });

  it("sem nome do vendedor, fala 'O representante'", () => {
    expect(sentOrderHint(order({ sellerName: null }))).toMatch(
      /^O representante ainda não abriu/
    );
  });
});

describe("compartilhar", () => {
  it("o total soma o imposto e o IPI", () => {
    expect(sentOrderTotal(order())).toBe(500);
    expect(sentOrderTotal(order({ taxAmount: "30.0000" }))).toBe(530);
  });

  it("o texto leva fábrica, produtos e recado — preço só como total estimado", () => {
    const text = sentOrderShareText(
      order({ clientRequestNote: "Entrega sexta" })
    );
    expect(text).toContain("Fábrica: Fábrica Alfa");
    expect(text).toContain("• 24 × Torneira (SKU-1)");
    expect(text).toContain("Recado: Entrega sexta");
    expect(text).not.toContain("Preço");
  });

  it("o assunto do email traz a fábrica e a data", () => {
    expect(sentOrderMailSubject(order())).toBe(
      "Pedido Fábrica Alfa — 10/11/2026"
    );
  });

  it("nome do PDF sem acento nem barra", () => {
    expect(sentOrderFileName(order())).toBe(
      "pedido-fabrica-alfa-10-11-2026.pdf"
    );
  });
});

describe("sentOrdersHref", () => {
  it("página 1 sem query", () => {
    expect(sentOrdersHref("tok", 1)).toBe("/p/tok/enviados");
    expect(sentOrdersHref("tok", 3)).toBe("/p/tok/enviados?p=3");
  });

  it("guarda o recorte junto com a página", () => {
    expect(sentOrdersHref("tok", 1, "pedidos")).toBe(
      "/p/tok/enviados?tipo=pedidos"
    );
    expect(sentOrdersHref("tok", 2, "orcamentos")).toBe(
      "/p/tok/enviados?tipo=orcamentos&p=2"
    );
    expect(sentOrdersHref("tok", 2, "todos")).toBe("/p/tok/enviados?p=2");
  });
});

describe("recorte da lista", () => {
  it("valor estranho na URL cai em 'todos'", () => {
    expect(parseSentOrdersTab(undefined)).toBe("todos");
    expect(parseSentOrdersTab("xyz")).toBe("todos");
    expect(parseSentOrdersTab("orcamentos")).toBe("orcamentos");
  });

  it("cada aba pede um recorte ao backend", () => {
    expect(sentOrdersKind("todos")).toBe("ALL");
    expect(sentOrdersKind("pedidos")).toBe("ORDER");
    expect(sentOrdersKind("orcamentos")).toBe("QUOTE");
  });
});

describe("cartão da lista", () => {
  it("pedido feito abre a tela de compra; orçamento, a do enviado", () => {
    expect(sentOrderHref("tok", order({ status: "CONFIRMED" }))).toBe(
      "/p/tok/pedidos/sent-1"
    );
    expect(sentOrderHref("tok", order({ status: "SENT" }))).toBe(
      "/p/tok/enviados/sent-1"
    );
    expect(sentOrderHref("tok", order({ status: "CANCELLED" }))).toBe(
      "/p/tok/enviados/sent-1"
    );
  });

  it("a linha do número diz se é pedido ou orçamento", () => {
    expect(sentOrderNumberLine(order({ status: "DELIVERED" }))).toMatch(
      /^Pedido nº /
    );
    expect(sentOrderNumberLine(order({ status: "DRAFT" }))).toMatch(
      /^Orçamento nº /
    );
  });

  it("conta as páginas com pelo menos uma", () => {
    expect(sentOrdersPageCount(0, 10)).toBe(1);
    expect(sentOrdersPageCount(10, 10)).toBe(1);
    expect(sentOrdersPageCount(11, 10)).toBe(2);
    expect(sentOrdersPageCount(50, 10)).toBe(5);
  });

  it("leva a busca na URL e deixa o padrão de fora", () => {
    expect(sentOrdersHref("tok", 1, "todos", "  ")).toBe("/p/tok/enviados");
    expect(sentOrdersHref("tok", 2, "pedidos", " Delta ")).toBe(
      "/p/tok/enviados?tipo=pedidos&busca=Delta&p=2"
    );
  });
});
