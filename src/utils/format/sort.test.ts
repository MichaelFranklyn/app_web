import { describe, expect, it } from "vitest";

import { sortObjectsInArray } from "./sort";

describe("sortObjectsInArray", () => {
  it("ordena asc por chave com collator numérico", () => {
    const a = [{ n: "item10" }, { n: "item2" }, { n: "item1" }];
    expect(
      sortObjectsInArray(a)
        .byKey("n")
        .asc()
        .map((x) => x.n)
    ).toEqual(["item1", "item2", "item10"]);
  });

  it("ordena desc", () => {
    const a = [{ v: 1 }, { v: 3 }, { v: 2 }];
    expect(
      sortObjectsInArray(a)
        .byKey("v")
        .desc()
        .map((x) => x.v)
    ).toEqual([3, 2, 1]);
  });

  it("acessa caminho aninhado via inKey", () => {
    const a = [{ p: { v: 2 } }, { p: { v: 1 } }];
    expect(
      sortObjectsInArray(a)
        .byKey("p")
        .inKey("v")
        .asc()
        .map((x) => x.p.v)
    ).toEqual([1, 2]);
  });

  it("joga nulos/undefined para o fim", () => {
    const a = [{ v: 2 }, { v: null }, { v: 1 }];
    expect(
      sortObjectsInArray(a)
        .byKey("v")
        .asc()
        .map((x) => x.v)
    ).toEqual([1, 2, null]);
  });

  it("aplica ordem customizada com as()", () => {
    const a = [{ s: "low" }, { s: "high" }, { s: "mid" }];
    expect(
      sortObjectsInArray(a)
        .byKey("s")
        .as("high", "mid", "low")
        .map((x) => x.s)
    ).toEqual(["high", "mid", "low"]);
  });

  it("desempata com thenByKey", () => {
    const a = [
      { g: "a", n: 2 },
      { g: "a", n: 1 },
      { g: "b", n: 1 },
    ];
    const r = sortObjectsInArray(a).byKey("g").asc().thenByKey("n").asc();
    expect(r.map((x) => `${x.g}${x.n}`)).toEqual(["a1", "a2", "b1"]);
  });

  it("compara datas e booleanos", () => {
    const d = [{ d: new Date(2026, 0, 2) }, { d: new Date(2026, 0, 1) }];
    expect(
      sortObjectsInArray(d)
        .byKey("d")
        .asc()
        .map((x) => x.d.getDate())
    ).toEqual([1, 2]);
    const b = [{ f: true }, { f: false }];
    expect(
      sortObjectsInArray(b)
        .byKey("f")
        .asc()
        .map((x) => x.f)
    ).toEqual([false, true]);
  });

  it("lida com array vazio", () => {
    expect(sortObjectsInArray<{ x: number }>([]).byKey("x").asc()).toHaveLength(
      0
    );
  });

  it("trata caminho aninhado quebrado como valor nulo (sem erro)", () => {
    // 'x' é número, mas pedimos 'x.y' → getValue retorna undefined; ambos
    // nulos → mantém a ordem original sem quebrar.
    const a = [{ x: 5 }, { x: 3 }];
    const r = sortObjectsInArray(a).byKey("x").inKey("y").asc();
    expect(r.map((i) => i.x)).toEqual([5, 3]);
  });

  it("compara valores de tipos mistos via collator de strings", () => {
    const a = [{ v: 2 }, { v: "10" }, { v: 1 }];
    const r = sortObjectsInArray(a as { v: unknown }[])
      .byKey("v")
      .asc();
    expect(r).toHaveLength(3);
  });
});
