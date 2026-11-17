import { describe, expect, it, vi } from "vitest";

import { createDraftItems } from "./createDraftItems";
import { DraftItem } from "./interface";

const item = (productId: string, extra: Partial<DraftItem> = {}) =>
  ({
    productId,
    productLabel: `Produto ${productId}`,
    tierId: "",
    quantity: "2",
    unitPrice: "10.50",
    discount: "0",
    ipiRate: "0",
    isPromo: false,
    ...extra,
  }) as unknown as DraftItem;

describe("createDraftItems", () => {
  it("manda o rascunho numa chamada só, do mais antigo para o mais novo", async () => {
    const mutate = vi.fn(async () => ({
      data: { createOrderItems: { status: true, message: "ok", data: [] } },
    }));

    // O wizard lista do mais novo para o mais antigo.
    await createDraftItems(mutate, "o1", [item("c"), item("b"), item("a")]);

    expect(mutate).toHaveBeenCalledOnce();
    const { variables } = (
      mutate.mock.calls[0] as unknown as [
        {
          variables: {
            orderId: string;
            items: { productId: string; tierId: unknown; source: string }[];
          };
        },
      ]
    )[0];
    expect(variables.orderId).toBe("o1");
    expect(variables.items.map((l) => l.productId)).toEqual(["a", "b", "c"]);
    expect(variables.items[0]).toMatchObject({
      tierId: null,
      source: "MANUAL",
    });
  });

  it("lote recusado levanta com a mensagem do backend, que diz a linha", async () => {
    const mutate = vi.fn(async () => ({
      data: {
        createOrderItems: {
          status: false,
          message: "Item 2 (Cimento): Produto não encontrado",
          data: null,
        },
      },
    }));

    await expect(createDraftItems(mutate, "o1", [item("a")])).rejects.toThrow(
      "Item 2 (Cimento): Produto não encontrado"
    );
  });
});
