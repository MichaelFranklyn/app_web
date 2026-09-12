import { describe, expect, it } from "vitest";

import { PriceItem } from "./interface";
import { groupByPriceList, UNGROUPED_KEY } from "./utils";

const item = (id: string, listId: string | null): PriceItem => ({
  id,
  unitPrice: "10.00",
  unitPriceWithImpost: "10.52",
  priceList: listId
    ? {
        id: listId,
        name: `Tabela ${listId}`,
        validFrom: "2026-01-01",
        validUntil: null,
        isActive: true,
      }
    : null,
  tier: { id: "tier-1", name: "Platina" },
});

describe("groupByPriceList", () => {
  it("junta os preços da mesma tabela, na ordem em que a tabela apareceu", () => {
    const groups = groupByPriceList([
      item("a", "list-1"),
      item("b", "list-2"),
      item("c", "list-1"),
    ]);

    expect(groups.map((g) => g.priceList?.id)).toEqual(["list-1", "list-2"]);
    expect(groups[0].items.map((i) => i.id)).toEqual(["a", "c"]);
  });

  it("preço sem tabela vira um grupo só, e não some da tela", () => {
    // Item órfão existe (tabela apagada, importação antiga): ele precisa
    // aparecer para alguém poder consertá-lo.
    const groups = groupByPriceList([item("a", null), item("b", null)]);

    expect(groups).toHaveLength(1);
    expect(groups[0].priceList).toBeNull();
    expect(groups[0].items).toHaveLength(2);
  });

  it("sem preço nenhum, não inventa grupo", () => {
    expect(groupByPriceList([])).toEqual([]);
    expect(UNGROUPED_KEY).toBe("__none__");
  });
});
