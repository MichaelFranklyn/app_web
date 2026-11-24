import { describe, expect, it } from "vitest";

import {
  LONG_UPSTREAM_TIMEOUT_MS,
  UPSTREAM_TIMEOUT_MS,
  upstreamTimeoutFor,
} from "./utils";
import { maxDuration } from "./route";

describe("teto da chamada ao backend", () => {
  it("importações ganham o teto longo; o resto fica no curto", () => {
    for (const op of [
      "ImportFactoryPriceList",
      "ConfirmOrderImport",
      "PreviewNfeImport",
      "InvoiceOrdersFromNfe",
    ]) {
      expect(upstreamTimeoutFor(op)).toBe(LONG_UPSTREAM_TIMEOUT_MS);
    }
    expect(upstreamTimeoutFor("Orders")).toBe(UPSTREAM_TIMEOUT_MS);
    expect(upstreamTimeoutFor(undefined)).toBe(UPSTREAM_TIMEOUT_MS);
  });

  it("o teto longo cabe no limite da função", () => {
    expect(LONG_UPSTREAM_TIMEOUT_MS).toBeLessThan(maxDuration * 1000);
  });
});
