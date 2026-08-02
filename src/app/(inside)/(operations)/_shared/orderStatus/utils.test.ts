import { describe, expect, it } from "vitest";

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  orderStatusLabel,
  orderStatusTone,
} from "./utils";

describe("orderStatusLabel", () => {
  // O backend manda o NOME do enum. Um mapa indexado pelo valor em português
  // deixava a tag do pedido em inglês na tela do cliente.
  it("traduz todos os nomes de enum que o backend envia", () => {
    expect(orderStatusLabel("CONFIRMED")).toBe("Confirmado");
    expect(orderStatusLabel("INVOICED")).toBe("Faturado");
    expect(orderStatusLabel("DELIVERED")).toBe("Entregue");
    expect(orderStatusLabel("CANCELLED")).toBe("Cancelado");
    expect(orderStatusLabel("DRAFT")).toBe("Orçamento");
    expect(orderStatusLabel("SENT")).toBe("Orçamento enviado");
  });

  it("nenhum rótulo escapa em inglês", () => {
    Object.entries(ORDER_STATUS_LABELS).forEach(([status, label]) => {
      expect(label).not.toBe(status);
    });
  });

  it("devolve o status cru quando não conhece", () => {
    expect(orderStatusLabel("WHATEVER")).toBe("WHATEVER");
  });
});

describe("orderStatusTone", () => {
  it("dá uma cor a cada status conhecido e cai em neutral no resto", () => {
    ORDER_STATUS_OPTIONS.forEach((option) => {
      expect(orderStatusTone(option.value)).toBeTruthy();
    });
    expect(orderStatusTone("WHATEVER")).toBe("neutral");
  });
});

describe("ORDER_STATUS_OPTIONS", () => {
  it("usa o mesmo rótulo do mapa, na ordem do fluxo do pedido", () => {
    expect(ORDER_STATUS_OPTIONS.map((o) => o.value)).toEqual([
      "DRAFT",
      "SENT",
      "CONFIRMED",
      "INVOICED",
      "DELIVERED",
      "CANCELLED",
    ]);
    ORDER_STATUS_OPTIONS.forEach((option) => {
      expect(option.label).toBe(ORDER_STATUS_LABELS[option.value]);
    });
  });
});
