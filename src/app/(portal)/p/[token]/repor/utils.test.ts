import { describe, expect, it } from "vitest";

import { groupByFactory, groupSummary } from "./utils";

const item = (
  factoryName: string,
  productName: string,
  daysRemaining: number
) => ({
  factoryName,
  productName,
  daysRemaining,
});

describe("groupByFactory", () => {
  it("junta por fábrica e põe o que já acabou primeiro", () => {
    const groups = groupByFactory([
      item("Tigre", "Joelho", 5),
      item("HERC", "Torneira", 3),
      item("Tigre", "Luva", -2),
      item("HERC", "Tanque", 10),
    ]);

    expect(groups.map((g) => g.factoryName)).toEqual(["Tigre", "HERC"]);
    expect(groups[0].items.map((i) => i.productName)).toEqual([
      "Luva",
      "Joelho",
    ]);
    expect(groups[0].runOut).toBe(1);
    expect(groups[1].runOut).toBe(0);
  });

  it("empate no mais urgente: vem a fábrica com mais produtos acabados", () => {
    const groups = groupByFactory([
      item("A", "x", 0),
      item("B", "y", 0),
      item("B", "z", -1),
    ]);
    expect(groups.map((g) => g.factoryName)).toEqual(["B", "A"]);
  });
});

describe("groupSummary", () => {
  it("diz o tamanho e quantos já acabaram", () => {
    expect(groupSummary({ items: [1, 2, 3], runOut: 2 })).toBe(
      "3 produtos, 2 já devem ter acabado"
    );
    expect(groupSummary({ items: [1], runOut: 1 })).toBe(
      "1 produto, 1 já deve ter acabado"
    );
    expect(groupSummary({ items: [1, 2], runOut: 0 })).toBe("2 produtos");
  });
});
