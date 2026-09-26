import { describe, expect, it } from "vitest";

import {
  buildExecutionExportRows,
  executionTone,
  recordedByPerson,
} from "./utils";
import { ExecutionSellerRow } from "./interface";

const row = (patch: Partial<ExecutionSellerRow> = {}): ExecutionSellerRow => ({
  sellerId: "s1",
  sellerName: "Celso",
  planned: 189,
  worked: 3,
  workedInferred: 1,
  autoClosed: 150,
  pending: 36,
  converted: 9,
  executionRate: 0.0159,
  conversionRate: 0.0476,
  orderAmount: "0",
  ...patch,
});

describe("recordedByPerson", () => {
  it("desconta o que o pedido provou do que foi respondido", () => {
    expect(recordedByPerson(row())).toBe(2);
  });

  it("nunca fica negativo", () => {
    expect(recordedByPerson(row({ worked: 0, workedInferred: 1 }))).toBe(0);
  });
});

describe("executionTone", () => {
  it("abaixo de 30% o motor não pode ser julgado", () => {
    expect(executionTone(0.29)).toBe("urgente");
  });

  it("na régua exata já sai do vermelho", () => {
    expect(executionTone(0.3)).toBe("atencao");
  });

  it("acima de 60% a rotina está sendo seguida", () => {
    expect(executionTone(0.6)).toBe("ok");
  });
});

describe("buildExecutionExportRows", () => {
  it("leva as colunas na ordem dos cabeçalhos", () => {
    expect(buildExecutionExportRows([row()])[0]).toEqual([
      "Celso",
      189,
      expect.any(String),
      2,
      1,
      36,
      150,
      9,
    ]);
  });
});
