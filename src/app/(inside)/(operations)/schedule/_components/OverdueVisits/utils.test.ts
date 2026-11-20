import { describe, expect, it } from "vitest";

import { plannedMoment } from "./utils";

describe("plannedMoment", () => {
  // A resposta chega depois, mas o fato aconteceu no dia planejado: é essa data
  // que vira `lastVisitDate` e reinicia a cadência de visita do cliente.
  it("aponta para o dia planejado, não para hoje", () => {
    const iso = plannedMoment("2026-07-31");
    expect(iso).not.toBeNull();
    const local = new Date(iso as string);
    expect(local.getFullYear()).toBe(2026);
    expect(local.getMonth()).toBe(6); // julho
    expect(local.getDate()).toBe(31);
  });

  // Meia-noite local viraria o dia anterior ao converter para UTC no Brasil.
  it("usa meio-dia local, para o fuso não puxar o dia para trás", () => {
    const iso = plannedMoment("2026-07-31") as string;
    expect(new Date(iso).getHours()).toBe(12);
    expect(iso.endsWith("Z")).toBe(true);
  });

  it("devolve null quando a data não é utilizável", () => {
    expect(plannedMoment("")).toBeNull();
    expect(plannedMoment("31/07/2026")).toBeNull();
    expect(plannedMoment("2026-07")).toBeNull();
  });
});
