import { describe, expect, it } from "vitest";

import { visibleSettingsNav } from "./navigation";

const labels = (role?: string | null) =>
  visibleSettingsNav(role).flatMap((g) => g.links.map((l) => l.label));

describe("visibleSettingsNav", () => {
  it("o dono vê tudo", () => {
    expect(labels("OWNER")).toEqual([
      "Empresa",
      "Plano",
      "Pessoas",
      "Catálogos",
      "Trazer dados",
    ]);
  });

  it("o administrador não vê o que é do dono, nem o grupo vazio", () => {
    expect(labels("ADMIN")).toEqual(["Pessoas", "Catálogos", "Trazer dados"]);
    expect(visibleSettingsNav("ADMIN").map((g) => g.label)).toEqual([
      "Equipe",
      "Cadastros",
    ]);
  });

  it("o vendedor não vê nenhuma tela", () => {
    expect(visibleSettingsNav("SELLER")).toEqual([]);
    expect(visibleSettingsNav(null)).toEqual([]);
  });
});
