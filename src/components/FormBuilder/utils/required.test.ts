import { describe, expect, it } from "vitest";

import { FormStepSchema } from "../interface";
import { isEmptyValue, requiredFieldsFilled } from "./required";

const STEPS: FormStepSchema[] = [
  {
    id: "s",
    sections: [
      {
        id: "a",
        fields: [
          { name: "kind", type: "radio", required: true, options: [] },
          {
            name: "client",
            type: "select-single",
            required: true,
            options: [],
          },
          { name: "notes", type: "text" },
        ],
      },
      {
        id: "rep",
        name: "rows",
        isRepeatable: true,
        fields: [{ name: "qty", type: "number", required: true }],
      },
    ],
  },
];

describe("isEmptyValue", () => {
  it.each([
    [null, true],
    [undefined, true],
    ["  ", true],
    [[], true],
    [{ value: "" }, true],
    [new Date("x"), true],
    ["a", false],
    [0, false],
    [false, false],
    [{ value: "1", label: "Um" }, false],
    [new Date(2026, 0, 1), false],
  ])("%p → %p", (value, expected) => {
    expect(isEmptyValue(value)).toBe(expected);
  });
});

describe("requiredFieldsFilled", () => {
  it("exige todos os obrigatórios e ignora os opcionais", () => {
    expect(requiredFieldsFilled(STEPS, { kind: "order" })).toBe(false);
    expect(requiredFieldsFilled(STEPS, { kind: "order", client: "c1" })).toBe(
      true
    );
  });

  it("não olha campos de seção repetível", () => {
    expect(
      requiredFieldsFilled(STEPS, { kind: "order", client: "c1", rows: [] })
    ).toBe(true);
  });
});
