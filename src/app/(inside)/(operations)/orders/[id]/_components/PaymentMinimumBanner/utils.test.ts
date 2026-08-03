import { describe, expect, it } from "vitest";

import { PaymentTermRef } from "../../interface";
import { reachableTermNames } from "./utils";

const term = (name: string, minOrderAmount: number | null): PaymentTermRef => ({
  id: name,
  name,
  installmentsDays: [],
  minOrderAmount,
});

const TERMS = [
  term("À vista", null),
  term("30/60", 1500),
  term("30/60/90", 3000),
];

describe("reachableTermNames", () => {
  it("lista só as condições que o valor alcança", () => {
    expect(reachableTermNames(1840, TERMS)).toEqual(["30/60", "À vista"]);
  });

  it("ordena do maior piso para o menor — a sugestão mais próxima vem primeiro", () => {
    // Quem queria 30/60/90 prefere 30/60 a "À vista".
    expect(reachableTermNames(5000, TERMS)[0]).toBe("30/60/90");
  });

  it("trata condição sem piso como sempre alcançável", () => {
    expect(reachableTermNames(0, TERMS)).toEqual(["À vista"]);
  });

  it("devolve vazio quando nenhuma condição é alcançada", () => {
    expect(reachableTermNames(100, [term("30/60", 1500)])).toEqual([]);
  });
});
