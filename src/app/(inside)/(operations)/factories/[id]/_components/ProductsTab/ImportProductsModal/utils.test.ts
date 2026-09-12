import { describe, expect, it } from "vitest";

import { rowToInput } from "./utils";

describe("rowToInput", () => {
  it("lê a linha do modelo pela posição das colunas", () => {
    expect(
      rowToInput([
        "CIM-50KG",
        "Cimento CP-II",
        "Cimentos",
        "Saco",
        "Pallet",
        "12",
      ])
    ).toEqual({
      sku: "CIM-50KG",
      name: "Cimento CP-II",
      category: "Cimentos",
      unit: "Saco",
      unitLabel: "Pallet",
      unitPerPack: 12,
    });
  });

  it("aceita a vírgula decimal que o Excel brasileiro escreve", () => {
    // A planilha vem do computador do usuário: "1,5" é o que ele vê e digita.
    expect(rowToInput(["A", "B", "C", "D", "E", "1,5"]).unitPerPack).toBe(1.5);
  });

  it("tira o espaço que sobra do copiar e colar", () => {
    expect(
      rowToInput(["  CIM-50KG  ", " Cimento ", "", "", "", " 12 "])
    ).toMatchObject({
      sku: "CIM-50KG",
      name: "Cimento",
      unitPerPack: 12,
    });
  });

  it("linha curta não quebra a leitura — quem recusa é o backend", () => {
    // O commit é por linha: a incompleta sobe como está e volta recusada (o
    // caso de uso rejeita `unit_per_pack <= 0`), e as demais entram.
    const row = rowToInput(["CIM-50KG"]);

    expect(row).toEqual({
      sku: "CIM-50KG",
      name: "",
      category: "",
      unit: "",
      unitLabel: "",
      unitPerPack: 0,
    });
  });

  it("texto no lugar do número não vira zero disfarçado", () => {
    // Zero é recusado pelo backend; NaN também. O que não pode é virar 1.
    expect(rowToInput(["A", "B", "C", "D", "E", "doze"]).unitPerPack).toBeNaN();
  });
});
