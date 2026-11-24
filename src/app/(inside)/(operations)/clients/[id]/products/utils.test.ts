import { describe, expect, it } from "vitest";
import { ClientProductAnalysisRow } from "./interface";
import {
  cycleLabel,
  overdueLabel,
  roundedUnits,
  isStaple,
  presenceShare,
  summarizeAnalysis,
} from "./utils";

const row = (
  overrides: Partial<ClientProductAnalysisRow> = {}
): ClientProductAnalysisRow => ({
  productId: "p1",
  factoryId: "f1",
  orderCount: 5,
  factoryOrderCount: 5,
  firstPurchaseDate: "2026-01-10",
  lastPurchaseDate: "2026-08-10",
  daysSinceLast: 24,
  totalUnits: "50",
  avgUnits: "10",
  lastUnits: "10",
  totalAmount: "1000",
  avgIntervalDays: 30,
  expectedNextDate: "2026-09-09",
  overdueDays: -6,
  status: "ON_TRACK",
  product: { id: "p1", name: "Produto", sku: "SKU1" },
  factory: null,
  ...overrides,
});

describe("presenceShare / isStaple", () => {
  it("item fixo é o que entra em quase todo pedido", () => {
    expect(presenceShare(row({ orderCount: 9, factoryOrderCount: 10 }))).toBe(
      0.9
    );
    expect(isStaple(row({ orderCount: 9, factoryOrderCount: 10 }))).toBe(true);
  });

  it("presença alta com poucos pedidos ainda não é hábito", () => {
    // 1 de 1 é 100%, e não diz nada sobre o cliente: ele comprou uma vez.
    expect(isStaple(row({ orderCount: 1, factoryOrderCount: 1 }))).toBe(false);
  });

  it("produto ocasional não é item fixo", () => {
    expect(isStaple(row({ orderCount: 2, factoryOrderCount: 10 }))).toBe(false);
  });

  it("sem pedido nenhum não divide por zero", () => {
    expect(presenceShare(row({ orderCount: 0, factoryOrderCount: 0 }))).toBe(0);
  });
});

describe("summarizeAnalysis", () => {
  // "Compra sempre" é independente da situação, de propósito: um item fixo que
  // ele PAROU de comprar continua sendo item fixo — e é o pior de perder.
  it("conta cada situação e os itens fixos", () => {
    const summary = summarizeAnalysis([
      row({ status: "STOPPED", orderCount: 9, factoryOrderCount: 10 }),
      row({ status: "LATE" }),
      row({ status: "DUE" }),
      row({ status: "ON_TRACK" }),
      row({ status: "SINGLE", orderCount: 1, factoryOrderCount: 1 }),
    ]);
    expect(summary).toEqual({
      total: 5,
      stopped: 1,
      late: 1,
      due: 1,
      always: 4,
    });
  });

  it("lista vazia devolve zeros, não NaN", () => {
    expect(summarizeAnalysis([])).toEqual({
      total: 0,
      stopped: 0,
      late: 0,
      due: 0,
      always: 0,
    });
  });
});

describe("cycleLabel", () => {
  it("diz o ritmo de compra em dias", () => {
    expect(cycleLabel(30)).toBe("a cada 30 dias");
  });

  // Sem duas compras não há ritmo: inventar um número seria pior que o traço.
  it("sem ciclo mostra traço", () => {
    expect(cycleLabel(null)).toBe("—");
  });

  it("com uma compra só diz que ainda não há ritmo", () => {
    expect(cycleLabel(null, 1)).toBe("1 compra só, sem ritmo ainda");
  });
});

describe("roundedUnits", () => {
  it("arredonda a média para unidades inteiras", () => {
    expect(roundedUnits("12.37")).toBe(12);
  });

  it("abaixo de 1 mantém a fração em vez de mostrar zero", () => {
    expect(roundedUnits("0.4")).toBe("0.4");
  });
});

describe("overdueLabel", () => {
  it("diz quantos dias a data esperada passou", () => {
    expect(overdueLabel(12)).toBe("atrasada 12 dias");
    expect(overdueLabel(1)).toBe("atrasada 1 dia");
  });

  it("sem atraso não diz nada", () => {
    expect(overdueLabel(0)).toBeNull();
    expect(overdueLabel(null)).toBeNull();
  });
});
