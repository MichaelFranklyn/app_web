import { describe, expect, it } from "vitest";
import { columnsOf } from "./factorySection";

// A4 retrato em pontos.
const PAGE_W = 595;

describe("columnsOf", () => {
  const cols = columnsOf(PAGE_W);

  it("mantém as colunas na ordem de leitura, dentro da margem", () => {
    expect(cols.client).toBeLessThan(cols.order);
    expect(cols.order).toBeLessThan(cols.sequence);
    expect(cols.sequence).toBeLessThan(cols.date);
    expect(cols.date).toBeLessThan(cols.amount);
    expect(cols.amount).toBeLessThanOrEqual(PAGE_W - 40);
  });

  it("dá folga entre a data e o valor da comissão", () => {
    // A data ocupa ~50pt e o valor (alinhado à direita) chega a ~65pt em
    // "R$ 45.570,40": com menos folga que isso, um encostava no outro.
    expect(cols.amount - cols.date).toBeGreaterThanOrEqual(115);
  });

  it("reserva espaço de sobra para o nome do cliente", () => {
    expect(cols.clientMax).toBeGreaterThan(200);
  });
});
