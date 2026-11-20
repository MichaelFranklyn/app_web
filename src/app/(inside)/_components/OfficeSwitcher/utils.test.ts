import { describe, expect, it } from "vitest";

import { isAllOfficesScreen } from "./utils";

describe("isAllOfficesScreen", () => {
  it("vale na agenda e nas telas de dentro dela", () => {
    expect(isAllOfficesScreen("/schedule")).toBe(true);
    expect(isAllOfficesScreen("/schedule/plan")).toBe(true);
  });

  it("não vale no resto do sistema", () => {
    expect(isAllOfficesScreen("/orders")).toBe(false);
    expect(isAllOfficesScreen("/clients/123")).toBe(false);
    expect(isAllOfficesScreen("/schedules")).toBe(false);
  });
});
