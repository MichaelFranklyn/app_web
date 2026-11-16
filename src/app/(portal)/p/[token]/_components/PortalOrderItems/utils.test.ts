import { describe, expect, it } from "vitest";
import { PortalOrderItem } from "../../interface";
import { filterOrderItems, orderItemsPage, orderItemsPageCount } from "./utils";

const item = (
  id: string,
  productName: string,
  sku: string | null
): PortalOrderItem => ({
  id,
  productName,
  sku,
  quantity: "1",
  unitPrice: "1",
  subtotal: "1",
  ipiAmount: "0",
  ipiRate: "0",
  taxAmount: "0",
  unitPriceWithTax: "1",
});

describe("busca e paginação dos produtos do pedido", () => {
  const items = [
    item("1", "Torneira Cromada", "TC-10"),
    item("2", "Válvula", "VL-2"),
  ];

  it("busca por nome sem acento nem maiúscula", () => {
    expect(filterOrderItems(items, "valvula").map((i) => i.id)).toEqual(["2"]);
  });

  it("busca pelo código", () => {
    expect(filterOrderItems(items, "tc-1").map((i) => i.id)).toEqual(["1"]);
  });

  it("busca vazia devolve tudo", () => {
    expect(filterOrderItems(items, "  ")).toHaveLength(2);
  });

  it("pagina de 10 em 10 e prende a página ao intervalo", () => {
    const many = Array.from({ length: 23 }, (_, i) => i);
    expect(orderItemsPageCount(23)).toBe(3);
    expect(orderItemsPageCount(0)).toBe(1);
    expect(orderItemsPage(many, 3)).toEqual([20, 21, 22]);
    expect(orderItemsPage(many, 9)).toEqual([20, 21, 22]);
    expect(orderItemsPage(many, 0)).toEqual(many.slice(0, 10));
  });
});
