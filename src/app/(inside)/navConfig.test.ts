import { describe, expect, it } from "vitest";
import { visibleNav } from "./navConfig";

const hrefs = (role?: string) =>
  visibleNav(role)
    .filter((item) => "href" in item)
    .map((item) => (item as { href: string }).href);

const sections = (role?: string) =>
  visibleNav(role)
    .filter((item) => "section" in item)
    .map((item) => (item as { section: string }).section);

describe("visibleNav", () => {
  it("dá ao dono os três destinos de configuração", () => {
    expect(hrefs("OWNER")).toEqual(
      expect.arrayContaining([
        "/settings/company",
        "/settings/users",
        "/settings/catalog",
      ])
    );
    expect(sections("OWNER")).toContain("Configurações");
  });

  it("esconde Empresa do admin, que não é dono da conta", () => {
    // `updateCompany` é @is_owner no backend: o item levaria a um redirect.
    expect(hrefs("ADMIN")).not.toContain("/settings/company");
    expect(hrefs("ADMIN")).toEqual(
      expect.arrayContaining(["/settings/users", "/settings/catalog"])
    );
  });

  it("esconde a seção inteira do vendedor, sem deixar título solto", () => {
    expect(hrefs("SELLER")).not.toContain("/settings/users");
    expect(hrefs("SELLER")).not.toContain("/settings/catalog");
    expect(hrefs("SELLER")).not.toContain("/settings/company");
    expect(sections("SELLER")).not.toContain("Configurações");
  });

  it("não deixa divisor sobrando no fim da lista", () => {
    for (const role of ["OWNER", "ADMIN", "SELLER", undefined]) {
      const items = visibleNav(role);
      const last = items[items.length - 1];
      expect("divider" in last).toBe(false);
      expect("section" in last).toBe(false);
    }
  });

  it("mantém as operações para todo mundo", () => {
    for (const role of ["OWNER", "ADMIN", "SELLER"]) {
      expect(hrefs(role)).toEqual(
        expect.arrayContaining(["/orders", "/clients", "/factories"])
      );
    }
  });
});
