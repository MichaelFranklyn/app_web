import { describe, expect, it } from "vitest";
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  pickFactoryContact,
  toWhatsAppNumber,
} from "./utils";

/**
 * O telefone é a parte que não pode errar: um número montado errado abre a
 * conversa com um desconhecido, e o que sai por ali é o pedido de um cliente.
 * Por isso a função prefere devolver `null` a chutar.
 */
describe("toWhatsAppNumber", () => {
  it.each([
    ["(71) 98765-4321", "5571987654321"],
    ["71 98765-4321", "5571987654321"],
    ["71987654321", "5571987654321"],
    ["(71) 3648-0327", "557136480327"],
    ["71 3648-0327", "557136480327"],
  ])("monta o E.164 a partir de %s", (entrada, esperado) => {
    expect(toWhatsAppNumber(entrada)).toBe(esperado);
  });

  it.each([
    ["5571987654321", "5571987654321"],
    ["+55 71 98765-4321", "5571987654321"],
    ["557136480327", "557136480327"],
  ])("não duplica o DDI de %s", (entrada, esperado) => {
    expect(toWhatsAppNumber(entrada)).toBe(esperado);
  });

  it("recusa número sem DDD", () => {
    // Chutar o DDD da empresa mandaria o pedido para outro estado.
    expect(toWhatsAppNumber("98765-4321")).toBeNull();
    expect(toWhatsAppNumber("3648-0327")).toBeNull();
  });

  it.each([[""], [null], [undefined], ["   "], ["sem número"], ["123"]])(
    "recusa entrada inútil (%s)",
    (entrada) => {
      expect(toWhatsAppNumber(entrada as string)).toBeNull();
    }
  );

  it("recusa número comprido demais para ser telefone", () => {
    expect(toWhatsAppNumber("5571987654321999")).toBeNull();
  });
});

describe("buildOrderMessage", () => {
  const base = {
    orderCode: "A1B2C3D4",
    clientName: "Loja do João",
    clientCity: "Feira de Santana",
    clientState: "BA",
    factoryName: "Lukma",
    itemCount: 12,
    totalWithIpi: 8432.1,
    paymentTermLabel: "30/60/90",
  };

  it("traz o que a fábrica precisa para identificar e conferir", () => {
    const msg = buildOrderMessage(base);
    expect(msg).toContain("A1B2C3D4");
    expect(msg).toContain("Loja do João (Feira de Santana/BA)");
    expect(msg).toContain("Lukma");
    expect(msg).toContain("12 itens");
    expect(msg).toContain("8.432,10");
    expect(msg).toContain("30/60/90");
  });

  it("avisa do anexo", () => {
    // O `wa.me` não carrega arquivo: sem esta linha, a mensagem sai sozinha e a
    // fábrica recebe um resumo sem o pedido.
    expect(buildOrderMessage(base)).toContain("PDF em anexo");
  });

  it("marca o reenvio", () => {
    expect(buildOrderMessage({ ...base, isResend: true })).toContain("Reenvio");
    expect(buildOrderMessage(base)).not.toContain("Reenvio");
  });

  it("omite a condição quando o pedido não tem prazo", () => {
    const msg = buildOrderMessage({ ...base, paymentTermLabel: null });
    expect(msg).not.toContain("Condição");
  });

  it("omite o parêntese quando não há cidade nem estado", () => {
    const msg = buildOrderMessage({
      ...base,
      clientCity: null,
      clientState: null,
    });
    expect(msg).toContain("Cliente: Loja do João\n");
    expect(msg).not.toContain("()");
  });

  it("concorda o singular de item", () => {
    expect(buildOrderMessage({ ...base, itemCount: 1 })).toContain("1 item ");
  });
});

describe("buildWhatsAppUrl", () => {
  it("escapa a mensagem para a query string", () => {
    const url = buildWhatsAppUrl("5571987654321", "Pedido #1\nCliente: A & B");
    expect(url.startsWith("https://wa.me/5571987654321?text=")).toBe(true);
    // Quebra de linha e & precisam ir codificados, senão a mensagem chega
    // truncada no primeiro deles.
    expect(url).toContain("%0A");
    expect(url).toContain("%26");
    expect(url).not.toContain("\n");
  });
});

describe("pickFactoryContact", () => {
  it("prefere o contato principal", () => {
    const escolhido = pickFactoryContact([
      { name: "Rogério", phone: "(71) 3648-0327" },
      { name: "Carlos", phone: "(71) 98888-7777", isPrimary: true },
    ]);
    expect(escolhido?.contact.name).toBe("Carlos");
    expect(escolhido?.phone).toBe("5571988887777");
  });

  it("cai no próximo com telefone quando o principal não tem", () => {
    // Principal sem número não serve para o WhatsApp; desistir aqui desligaria
    // o botão de uma fábrica que tem outro contato utilizável.
    const escolhido = pickFactoryContact([
      { name: "Carlos", phone: null, isPrimary: true },
      { name: "Rogério", phone: "(71) 3648-0327" },
    ]);
    expect(escolhido?.contact.name).toBe("Rogério");
  });

  it("ignora contato com telefone inválido", () => {
    const escolhido = pickFactoryContact([
      { name: "Sem DDD", phone: "98765-4321" },
      { name: "Bom", phone: "(71) 98888-7777" },
    ]);
    expect(escolhido?.contact.name).toBe("Bom");
  });

  it("devolve null quando nenhum contato serve", () => {
    expect(pickFactoryContact([{ name: "X", phone: null }])).toBeNull();
    expect(pickFactoryContact([])).toBeNull();
    expect(pickFactoryContact(null)).toBeNull();
    expect(pickFactoryContact(undefined)).toBeNull();
  });
});
