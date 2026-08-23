import { describe, expect, it } from "vitest";
import { ANNUAL_BILLED_MONTHS, PLANS } from "../plans";
import { CardData } from "./interface";
import {
  DEMO_CARDS,
  findPlanByCode,
  simulateCharge,
  totalForCycle,
  validateCard,
} from "./utils";

const basic = PLANS.find((plan) => plan.code === "basic")!;
const enterprise = PLANS.find((plan) => plan.code === "enterprise")!;

const card = (overrides: Partial<CardData> = {}): CardData => ({
  number: DEMO_CARDS.approved,
  holder: "Michael Franklyn",
  expiry: "12/30",
  cvv: "123",
  ...overrides,
});

describe("findPlanByCode", () => {
  it("acha o plano pelo código da URL", () => {
    expect(findPlanByCode("pro")?.label).toBe("Pro");
  });

  it("devolve nulo para código ausente ou desconhecido", () => {
    // Link antigo e `?plano` digitado errado caem aqui, e a página mostra a
    // lista em vez de um checkout sem plano.
    expect(findPlanByCode(null)).toBeNull();
    expect(findPlanByCode("platinum")).toBeNull();
  });
});

describe("totalForCycle", () => {
  it("cobra a mensalidade no ciclo mensal", () => {
    expect(totalForCycle(basic, "monthly")).toBe(basic.demoMonthlyPrice);
  });

  it("cobra menos meses no ciclo anual", () => {
    expect(totalForCycle(basic, "annual")).toBe(
      basic.demoMonthlyPrice! * ANNUAL_BILLED_MONTHS
    );
  });

  it("não inventa total para plano sem preço de tabela", () => {
    expect(totalForCycle(enterprise, "monthly")).toBeNull();
  });
});

describe("simulateCharge", () => {
  it("aprova o cartão de teste", () => {
    expect(simulateCharge(card())).toBe("approved");
  });

  it("recusa o cartão de recusa, com ou sem máscara", () => {
    // O campo entrega o número mascarado; a comparação tem de ignorar isso,
    // senão a tela de recusa nunca seria alcançada pela interface.
    expect(simulateCharge(card({ number: DEMO_CARDS.declined }))).toBe(
      "declined"
    );
    expect(simulateCharge(card({ number: "4000000000000002" }))).toBe(
      "declined"
    );
  });
});

describe("validateCard", () => {
  it("aceita o cartão de teste preenchido", () => {
    expect(validateCard(card())).toEqual({});
  });

  it("exige 16 dígitos, validade MM/AA e CVV de 3", () => {
    const errors = validateCard(
      card({ number: "4242 4242", expiry: "1230", cvv: "1" })
    );

    expect(Object.keys(errors).sort()).toEqual(["cvv", "expiry", "number"]);
  });
});
