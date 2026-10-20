import { describe, expect, it } from "vitest";

import { variationFromLast } from "./utils";

describe("variationFromLast", () => {
  it("compara o preço de agora com o que ele pagou", () => {
    expect(variationFromLast(11, 10)).toBeCloseTo(10);
    expect(variationFromLast(9, 10)).toBeCloseTo(-10);
  });

  it("sem um dos dois, não há comparação", () => {
    expect(variationFromLast(0, 10)).toBeNull();
    expect(variationFromLast(10, null)).toBeNull();
  });
});
