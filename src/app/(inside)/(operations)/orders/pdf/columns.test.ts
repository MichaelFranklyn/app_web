import { describe, expect, it } from "vitest";

import { Order } from "../interface";
import { buildOrderTotals, ORDER_COLUMNS } from "./columns";

const order = (overrides: Partial<Order> = {}): Order =>
  ({
    id: "aabbccdd-1111-2222-3333-444455556666",
    orderDate: "2026-07-05",
    invoicedAt: "2026-07-12",
    totalAmount: "1000.00",
    commissionAmount: "30.00",
    status: "INVOICED",
    isDeliveryOverdue: false,
    seller: { id: "s1", name: "Ana" },
    client: {
      id: "c1",
      razaoSocial: "Bom Preço Comércio LTDA",
      nomeFantasia: "Mercado Bom Preço",
    },
    factory: {
      id: "f1",
      razaoSocial: "INDUSTRIA HERC LTDA",
      nomeFantasia: "Herc",
      nickname: null,
    },
    ...overrides,
  }) as Order;

const column = (header: string) =>
  ORDER_COLUMNS.find((item) => item.header === header)!;

describe("ORDER_COLUMNS", () => {
  it("tem as colunas da TELA, e nenhuma além delas", () => {
    // O papel é conferido contra a tabela: coluna a mais faz quem confere
    // procurar na tela um dado que não está lá. A data de faturamento já
    // apareceu aqui por isso — a lista de pedidos não a mostra.
    expect(ORDER_COLUMNS.map((item) => item.header)).toEqual([
      "PEDIDO",
      "CLIENTE",
      "FÁBRICA",
      "VENDEDOR",
      "DATA",
      "SITUAÇÃO",
      "VALOR",
      "COMISSÃO",
    ]);
  });

  it("mostra o pedido pelos 8 primeiros caracteres do id, em caixa alta", () => {
    expect(column("PEDIDO").value(order())).toBe("AABBCCDD");
  });

  it("leva o nome fantasia como segunda linha do cliente", () => {
    expect(column("CLIENTE").value(order())).toBe("Bom Preço Comércio LTDA");
    expect(column("CLIENTE").sub?.(order())).toBe("Mercado Bom Preço");
  });

  it("escreve a situação em português", () => {
    expect(column("SITUAÇÃO").value(order())).toBe("Faturado");
  });
});

describe("buildOrderTotals", () => {
  it("soma valor e comissão nas colunas em que eles estão", () => {
    const totals = buildOrderTotals([
      order(),
      order({ totalAmount: "500.50", commissionAmount: "15.50" }),
    ]);
    const valueIndex = ORDER_COLUMNS.findIndex((c) => c.header === "VALOR");
    const commissionIndex = ORDER_COLUMNS.findIndex(
      (c) => c.header === "COMISSÃO"
    );

    // O separador do `formatMoney` é espaço NÃO separável (Intl pt-BR); a
    // comparação normaliza para não depender do byte invisível.
    const plain = (value?: string) => value?.replace(/\u00a0/g, " ");
    expect(plain(totals[valueIndex])).toBe("R$ 1.500,50");
    expect(plain(totals[commissionIndex])).toBe("R$ 45,50");
  });
});
