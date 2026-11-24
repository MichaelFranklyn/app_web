import { describe, expect, it } from "vitest";

import { formatDuration } from "./duration";

describe("formatDuration", () => {
  it.each([
    [null, "—"],
    [undefined, "—"],
    [240, "240ms"],
    [999, "999ms"],
    [1000, "1,0s"],
    [2400, "2,4s"],
    [59_940, "59,9s"],
    [125_000, "2min"],
  ])("%s → %s", (ms, expected) => {
    expect(formatDuration(ms as number | null | undefined)).toBe(expected);
  });
});
