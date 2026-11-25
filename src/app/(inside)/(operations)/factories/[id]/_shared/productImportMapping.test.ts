import { describe, expect, it } from "vitest";

import { autoGuessMapping } from "./productImportMapping";

describe("autoGuessMapping — abreviação EMB", () => {
  it('"EMB" sozinho é unidades por embalagem', () => {
    const m = autoGuessMapping(["CÓDIGO", "DESCRIÇÃO", "EMB", "UN"]);
    expect(m.unitPerPack).toEqual({ kind: "column", index: 2 });
    expect(m.unit).toEqual({ kind: "column", index: 3 });
  });

  it('"EMBALAGEM" por extenso continua sendo o rótulo, não a quantidade', () => {
    const m = autoGuessMapping(["CÓDIGO", "DESCRIÇÃO", "EMBALAGEM"]);
    expect(m.unitPerPack).toEqual({ kind: "none" });
    expect(m.unitLabel).toEqual({ kind: "column", index: 2 });
  });
});
