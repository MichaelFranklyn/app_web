import { describe, expect, it } from "vitest";
import { parseSheetDate } from "./dates";

describe("parseSheetDate", () => {
  it("lê ISO, com ou sem hora", () => {
    expect(parseSheetDate("2026-05-04")).toBe("2026-05-04");
    expect(parseSheetDate("2026-05-04 13:22:00")).toBe("2026-05-04");
  });

  it("dia antes do mês: planilha brasileira", () => {
    expect(parseSheetDate("04/05/2026")).toBe("2026-05-04");
    expect(parseSheetDate("4/5/26")).toBe("2026-05-04");
    expect(parseSheetDate("04.05.2026")).toBe("2026-05-04");
    expect(parseSheetDate("04/05/2026 10:30")).toBe("2026-05-04");
  });

  it("número de série do Excel", () => {
    expect(parseSheetDate("46146")).toBe("2026-05-04");
  });

  it("recusa o que não é data em vez de inventar uma", () => {
    expect(parseSheetDate("31/02/2026")).toBeNull();
    expect(parseSheetDate("pedido 123")).toBeNull();
    expect(parseSheetDate("")).toBeNull();
    expect(parseSheetDate("12345")).toBeNull();
  });
});
