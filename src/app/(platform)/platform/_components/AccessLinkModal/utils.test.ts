import { describe, expect, it } from "vitest";
import { validityLabel } from "./utils";

describe("validityLabel", () => {
  it.each([
    [15, "15 minutos"],
    [1, "1 minuto"],
    [60, "1 hora"],
    [120, "2 horas"],
    [1440, "1 dia"],
    [4320, "3 dias"],
    [90, "90 minutos"],
  ])("%i → %s", (minutes, label) => {
    expect(validityLabel(minutes)).toBe(label);
  });
});
