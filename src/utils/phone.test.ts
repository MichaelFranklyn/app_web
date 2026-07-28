import { describe, expect, it } from "vitest";
import { telHref, whatsappHref } from "./phone";

describe("telHref", () => {
  it("monta o link internacional a partir do celular mascarado", () => {
    expect(telHref("(11) 98765-4321")).toBe("tel:+5511987654321");
  });

  it("aceita fixo de 10 dígitos", () => {
    expect(telHref("(11) 3456-7890")).toBe("tel:+551134567890");
  });

  it("recusa número curto demais para discar", () => {
    expect(telHref("3456-7890")).toBeNull();
  });

  it("recusa vazio e nulo", () => {
    expect(telHref("")).toBeNull();
    expect(telHref(null)).toBeNull();
    expect(telHref(undefined)).toBeNull();
  });
});

describe("whatsappHref", () => {
  it("monta o wa.me para celular", () => {
    expect(whatsappHref("(11) 98765-4321")).toBe("https://wa.me/5511987654321");
  });

  it("recusa fixo — não tem WhatsApp", () => {
    expect(whatsappHref("(11) 3456-7890")).toBeNull();
  });

  it("codifica a mensagem pronta", () => {
    expect(whatsappHref("(11) 98765-4321", "Olá, tudo bem?")).toBe(
      "https://wa.me/5511987654321?text=Ol%C3%A1%2C%20tudo%20bem%3F"
    );
  });

  it("recusa nulo", () => {
    expect(whatsappHref(null)).toBeNull();
  });
});
