import { describe, expect, it } from "vitest";

import { createInput, orderLabel, updateInput } from "./utils";

describe("createInput", () => {
  const form = {
    clientId: { value: "c1", label: "Zé" },
    dueDate: "2026-10-20",
    reason: "  Retornar sobre o orçamento  ",
    notes: "   ",
    orderId: { value: "o1", label: "pedido" },
    responsibleUserId: { value: "u2", label: "Ana" },
  };

  it("gestor manda o responsável escolhido; o resto vai limpo", () => {
    expect(
      createInput(form, { clientId: null, orderId: null, canAssign: true })
    ).toEqual({
      clientId: "c1",
      dueDate: "2026-10-20",
      reason: "Retornar sobre o orçamento",
      notes: null,
      orderId: "o1",
      responsibleUserId: "u2",
      returnItemId: null,
    });
  });

  it("vendedor não manda responsável — agenda sempre para si", () => {
    const input = createInput(form, {
      clientId: null,
      orderId: null,
      canAssign: false,
    });
    expect(input.responsibleUserId).toBeNull();
  });

  it("cliente e pedido fixados pela tela vencem o formulário", () => {
    const input = createInput(
      { ...form, clientId: "", orderId: "" },
      { clientId: "c9", orderId: "o9", canAssign: true }
    );
    expect(input.clientId).toBe("c9");
    expect(input.orderId).toBe("o9");
  });

  it("o retorno de onde o contato veio vai junto", () => {
    const input = createInput(form, {
      clientId: "c1",
      orderId: null,
      canAssign: false,
      returnItemId: "item-9",
    });
    expect(input.returnItemId).toBe("item-9");
  });

  it("responsável em branco vira nulo (= quem agenda)", () => {
    const input = createInput(
      { ...form, responsibleUserId: "" },
      { clientId: null, orderId: null, canAssign: true }
    );
    expect(input.responsibleUserId).toBeNull();
  });
});

describe("updateInput", () => {
  it("sem pedido escolhido, desvincula; responsável vazio não viaja", () => {
    expect(
      updateInput(
        { reason: "Ligar", notes: "", orderId: "", responsibleUserId: "" },
        true
      )
    ).toEqual({ reason: "Ligar", notes: null, orderId: null });
  });

  it("vendedor não transfere, mesmo com o campo preenchido", () => {
    const input = updateInput(
      { reason: "Ligar", responsibleUserId: { value: "u2", label: "Ana" } },
      false
    );
    expect(input).not.toHaveProperty("responsibleUserId");
  });
});

describe("orderLabel", () => {
  it("monta data, nota e fábrica, pulando o que falta", () => {
    expect(
      orderLabel({
        orderDate: "2026-08-12",
        invoiceNumber: "1234",
        factory: { nickname: "Planalto", nomeFantasia: null, razaoSocial: "X" },
      })
    ).toBe("12/08/2026 · NF 1234 · Planalto");
    expect(orderLabel({ orderDate: "2026-08-12", invoiceNumber: null })).toBe(
      "12/08/2026"
    );
  });
});
