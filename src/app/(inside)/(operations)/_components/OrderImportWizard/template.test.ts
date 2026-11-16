import { describe, expect, it } from "vitest";

import { ORDER_ITEMS_TEMPLATE_HEADERS } from "./template";
import { guessMapping } from "./utils";

describe("planilha modelo de itens do pedido", () => {
  it("cada coluna do modelo é reconhecida sozinha no passo Colunas", () => {
    expect(guessMapping(ORDER_ITEMS_TEMPLATE_HEADERS)).toEqual({
      sku: { kind: "column", index: 0 },
      quantity: { kind: "column", index: 1 },
      unitPrice: { kind: "column", index: 2 },
      ipiRate: { kind: "column", index: 3 },
    });
  });
});
