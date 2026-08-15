import { describe, expect, it } from "vitest";
import { PortalOrder } from "./interface";
import {
  hasIpi,
  installmentLabel,
  itemLineTotal,
  monthShortLabel,
  parsePortalPage,
  portalOrderDateLine,
  portalOrderTotal,
  portalStatusLabel,
  portalStatusTone,
  sortStockByUrgency,
  stockUrgency,
} from "./utils";

const order = (overrides: Partial<PortalOrder> = {}): PortalOrder => ({
  id: "1",
  orderDate: "2026-07-06",
  factoryName: "HERC",
  totalAmount: "1000.0000",
  ipiAmount: "0.0000",
  status: "CONFIRMED",
  invoicedAt: null,
  deliveredAt: null,
  estimatedDeliveryDate: null,
  ...overrides,
});

describe("portalOrderTotal", () => {
  it("soma o IPI ao valor da mercadoria", () => {
    expect(portalOrderTotal(order({ ipiAmount: "150.5000" }))).toBe(1150.5);
  });

  it("é o próprio valor quando não há IPI", () => {
    expect(portalOrderTotal(order())).toBe(1000);
    expect(hasIpi(order())).toBe(false);
  });
});

describe("portalOrderDateLine", () => {
  it("entregue mostra a data da entrega", () => {
    const line = portalOrderDateLine(
      order({ status: "DELIVERED", deliveredAt: "2026-07-31" })
    );
    expect(line).toBe("Entregue em 31/07/2026");
  });

  it("faturado prefere a previsão de entrega à data da nota", () => {
    const line = portalOrderDateLine(
      order({
        status: "INVOICED",
        invoicedAt: "2026-07-20",
        estimatedDeliveryDate: "2026-07-30",
      })
    );
    expect(line).toBe("Previsão de entrega: 30/07/2026");
  });

  it("faturado sem previsão cai na data da nota", () => {
    const line = portalOrderDateLine(
      order({ status: "INVOICED", invoicedAt: "2026-07-20" })
    );
    expect(line).toBe("Nota emitida em 20/07/2026");
  });

  it("confirmado mostra a data do pedido", () => {
    expect(portalOrderDateLine(order())).toBe("Pedido em 06/07/2026");
  });
});

describe("portalStatusLabel / portalStatusTone", () => {
  it("traduz o estado interno para linguagem de cliente", () => {
    expect(portalStatusLabel("CONFIRMED")).toBe("Pedido feito");
    expect(portalStatusLabel("INVOICED")).toBe("Nota emitida");
    expect(portalStatusLabel("DELIVERED")).toBe("Entregue");
  });

  it("só a entrega é verde", () => {
    expect(portalStatusTone("DELIVERED")).toBe("green");
    expect(portalStatusTone("INVOICED")).toBe("blue");
    expect(portalStatusTone("CONFIRMED")).toBe("neutral");
  });
});

describe("parsePortalPage", () => {
  it("lê a página da URL", () => {
    expect(parsePortalPage("3")).toBe(3);
  });

  it("volta para a primeira em qualquer entrada inválida", () => {
    expect(parsePortalPage(undefined)).toBe(1);
    expect(parsePortalPage("abc")).toBe(1);
    expect(parsePortalPage("-2")).toBe(1);
    expect(parsePortalPage("1.5")).toBe(1);
    expect(parsePortalPage("0")).toBe(1);
  });
});

describe("monthShortLabel", () => {
  it("encurta o mês para o eixo do gráfico", () => {
    expect(monthShortLabel("2026-08-01")).toBe("ago/26");
    expect(monthShortLabel("2025-12-01")).toBe("dez/25");
    expect(monthShortLabel("2026-01-01")).toBe("jan/26");
  });

  it("devolve a entrada quando ela não é um mês", () => {
    expect(monthShortLabel("2026-13-01")).toBe("2026-13-01");
  });
});

describe("stockUrgency", () => {
  it("acabou é vermelho", () => {
    expect(stockUrgency(0)).toEqual({
      label: "Deve ter acabado",
      tone: "red",
    });
    // Estoque estourado (dias negativos) lê igual a zerado para quem olha a
    // própria prateleira.
    expect(stockUrgency(-3).tone).toBe("red");
  });

  it("duas semanas ou menos é alerta", () => {
    expect(stockUrgency(15)).toEqual({
      label: "Acaba em ~15 dias",
      tone: "amber",
    });
    expect(stockUrgency(1).tone).toBe("amber");
  });

  it("acima disso é tranquilo", () => {
    expect(stockUrgency(16).tone).toBe("green");
  });

  it("sem estimativa não é urgência — é desconhecimento", () => {
    expect(stockUrgency(null)).toEqual({
      label: "Sem estimativa",
      tone: "neutral",
    });
  });
});

describe("sortStockByUrgency", () => {
  it("põe o que acaba primeiro no topo", () => {
    const ordenado = sortStockByUrgency([
      { daysRemaining: 30 },
      { daysRemaining: 0 },
      { daysRemaining: 12 },
    ]);

    expect(ordenado.map((i) => i.daysRemaining)).toEqual([0, 12, 30]);
  });

  it("manda o sem-estimativa para o fim", () => {
    const ordenado = sortStockByUrgency([
      { daysRemaining: null },
      { daysRemaining: 20 },
      { daysRemaining: null },
      { daysRemaining: 2 },
    ]);

    expect(ordenado.map((i) => i.daysRemaining)).toEqual([2, 20, null, null]);
  });

  it("não altera o array recebido", () => {
    const original = [{ daysRemaining: 9 }, { daysRemaining: 1 }];
    sortStockByUrgency(original);

    expect(original.map((i) => i.daysRemaining)).toEqual([9, 1]);
  });
});

describe("itemLineTotal", () => {
  it("soma o IPI da linha", () => {
    expect(itemLineTotal({ subtotal: "100.0000", ipiAmount: "6.5000" })).toBe(
      106.5
    );
  });
});

describe("installmentLabel", () => {
  it("traduz o status da parcela", () => {
    expect(installmentLabel("PENDING")).toBe("A pagar");
    expect(installmentLabel("PAID")).toBe("Pago");
  });

  it("status desconhecido não vira texto vazio na tela", () => {
    expect(installmentLabel("QUALQUER")).toBe("QUALQUER");
  });
});
