import { describe, expect, it } from "vitest";
import {
  EMPTY_TIER_FORM,
  PriceTier,
  baseTierOptions,
  dependentsOf,
  examplePrice,
  pricingCreateInput,
  pricingUpdateInput,
  tierToForm,
  validateTierForm,
} from "./utils";
import { describeDerived } from "../../_shared/derivedTier";

const gold: PriceTier = {
  id: "g",
  name: "Gold",
  baseTierId: null,
  adjustmentPercent: null,
  baseTier: null,
};
const diamante: PriceTier = {
  id: "d",
  name: "Diamante",
  baseTierId: "g",
  adjustmentPercent: "-10.00",
  baseTier: { id: "g", name: "Gold" },
};
const percentForm = {
  ...EMPTY_TIER_FORM,
  name: "Platina",
  kind: "percent" as const,
  baseTierId: "g",
  percent: "12,5",
};

describe("nível calculado", () => {
  it("descreve o calculado com o sinal", () => {
    expect(describeDerived(diamante)).toBe("Gold −10%");
    expect(describeDerived({ ...diamante, adjustmentPercent: "12.50" })).toBe(
      "Gold +12,5%"
    );
    expect(describeDerived(gold)).toBeNull();
  });

  it("base só entre os de preço próprio, fora ele mesmo", () => {
    expect(baseTierOptions([gold, diamante])).toEqual([
      { value: "g", label: "Gold" },
    ]);
    expect(baseTierOptions([gold, diamante], "g")).toEqual([]);
    expect(dependentsOf([gold, diamante], "g")).toEqual(["Diamante"]);
  });

  it("valida base, percentual e o teto do desconto", () => {
    expect(validateTierForm({ ...EMPTY_TIER_FORM, name: "X" })).toEqual({});
    const errors = validateTierForm({
      ...percentForm,
      baseTierId: null,
      percent: "",
    });
    expect(errors.baseTierId).toBeTruthy();
    expect(errors.percent).toBeTruthy();
    expect(
      validateTierForm({ ...percentForm, percent: "100" }).percent
    ).toMatch(/menor que 100%/);
    expect(
      validateTierForm({ ...percentForm, direction: "up", percent: "100" })
    ).toEqual({});
  });

  it("manda o percentual com sinal e a prévia acompanha", () => {
    expect(pricingCreateInput(percentForm)).toEqual({
      baseTierId: "g",
      adjustmentPercent: "-12.5",
    });
    expect(examplePrice(percentForm)).toBe(87.5);
    expect(examplePrice({ ...percentForm, direction: "up" })).toBe(112.5);
    expect(pricingCreateInput({ ...EMPTY_TIER_FORM, name: "X" })).toEqual({});
  });

  it("edição manda só o que mudou e volta a preço próprio com clearBaseTier", () => {
    const form = tierToForm(diamante);
    expect(form).toMatchObject({
      kind: "percent",
      direction: "down",
      percent: "10",
    });
    expect(pricingUpdateInput(form, diamante)).toEqual({});
    expect(pricingUpdateInput({ ...form, percent: "15" }, diamante)).toEqual({
      baseTierId: "g",
      adjustmentPercent: "-15",
    });
    expect(pricingUpdateInput({ ...form, kind: "own" }, diamante)).toEqual({
      clearBaseTier: true,
    });
    expect(pricingUpdateInput(tierToForm(gold), gold)).toEqual({});
  });
});
