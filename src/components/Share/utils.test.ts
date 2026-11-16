import { describe, expect, it } from "vitest";
import { mailtoHref, recipientLabel, whatsappShareHref } from "./utils";

describe("Share utils", () => {
  it("mailto leva destinatário, assunto e corpo codificados", () => {
    const href = mailtoHref({
      to: "rafael@exemplo.com",
      subject: "Pedido Alfa — 10/11",
      body: "Olá!\n• 2 × Torneira",
    });
    expect(href.startsWith("mailto:rafael@exemplo.com?subject=")).toBe(true);
    expect(href).toContain(encodeURIComponent("Pedido Alfa — 10/11"));
    expect(href).toContain(
      `body=${encodeURIComponent("Olá!\n• 2 × Torneira")}`
    );
  });

  it("WhatsApp com celular abre a conversa dele", () => {
    expect(whatsappShareHref("(71) 99999-8888", "oi")).toBe(
      "https://wa.me/5571999998888?text=oi"
    );
  });

  it("sem celular válido, o WhatsApp abre para escolher a conversa", () => {
    expect(whatsappShareHref(null, "oi")).toBe("https://wa.me/?text=oi");
    expect(whatsappShareHref("(71) 3333-4444", "oi")).toBe(
      "https://wa.me/?text=oi"
    );
  });

  it("destinatário com nome entre os sinais de endereço", () => {
    expect(recipientLabel("a@b.com", "Rafael")).toBe("Rafael <a@b.com>");
    expect(recipientLabel("a@b.com")).toBe("a@b.com");
  });
});
