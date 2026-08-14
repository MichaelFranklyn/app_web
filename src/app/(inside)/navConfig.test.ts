import { PlanFeature } from "@/services/plan";
import { describe, expect, it } from "vitest";
import { visibleNav } from "./navConfig";

/** Plano completo: nos casos sobre PAPEL, o plano não pode ser a variável que
 * esconde o item — senão o teste passaria pelo motivo errado. */
const ALL: PlanFeature[] = [
  "ROUTINES",
  "ANALYTICS",
  "REPORTS",
  "BULK_IMPORT",
  "GOALS",
  "COMMISSIONS",
  "NOTIFICATIONS",
];

const hrefs = (role?: string, features: PlanFeature[] = ALL) =>
  visibleNav(role, features)
    .filter((item) => "href" in item)
    .map((item) => (item as { href: string }).href);

const sections = (role?: string, features: PlanFeature[] = ALL) =>
  visibleNav(role, features)
    .filter((item) => "section" in item)
    .map((item) => (item as { section: string }).section);

describe("visibleNav — papel", () => {
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
      const items = visibleNav(role, ALL);
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

describe("visibleNav — plano", () => {
  it("esconde o que a empresa não contratou", () => {
    const semRotina = hrefs("OWNER", ["COMMISSIONS", "GOALS"]);
    expect(semRotina).not.toContain("/routines");
    expect(semRotina).toContain("/commissions");
    expect(semRotina).toContain("/goals");
  });

  it("corta antes do papel: nem o dono vê o que não foi contratado", () => {
    // Papel diz quem PODE; plano diz o que a empresa TEM. Um "OWNER vê tudo"
    // aqui furaria o contrato na tela mais visível do sistema.
    expect(hrefs("OWNER", [])).not.toContain("/goals");
    expect(hrefs("OWNER", [])).not.toContain("/commissions");
  });

  it("mantém o núcleo em qualquer plano", () => {
    // Pedido, cliente e fábrica são o que a empresa comprou ao assinar qualquer
    // plano — some daqui e o sistema deixa de existir para quem paga o básico.
    expect(hrefs("OWNER", [])).toEqual(
      expect.arrayContaining([
        "/dashboard",
        "/orders",
        "/clients",
        "/factories",
      ])
    );
  });

  it("tira a rota do dia junto com a rotina", () => {
    // O atalho não tem href fixo (resolve a data em runtime), então precisa ser
    // conferido pelo rótulo.
    const labels = visibleNav("SELLER", [])
      .filter((item) => "label" in item)
      .map((item) => (item as { label: string }).label);
    expect(labels).not.toContain("Rota do dia");
    expect(labels).not.toContain("Rotina da Semana");
  });

  it("não deixa seção órfã quando o plano esvazia o grupo", () => {
    const items = visibleNav("SELLER", []);
    const last = items[items.length - 1];
    expect("divider" in last).toBe(false);
    expect("section" in last).toBe(false);
  });
});
