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
  "PORTAL_ORDERS",
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
  it("configurações é UM item, para dono e administrador", () => {
    // As telas da área se escolhem no menu interno (settings/navigation.ts).
    for (const role of ["OWNER", "ADMIN"]) {
      const settings = hrefs(role).filter((h) => h.startsWith("/settings"));
      expect(settings).toEqual(["/settings"]);
      expect(sections(role)).not.toContain("Configurações");
    }
  });

  it("esconde configurações do vendedor", () => {
    expect(hrefs("SELLER").some((h) => h.startsWith("/settings"))).toBe(false);
  });

  it("não deixa divisor sobrando no fim da lista", () => {
    for (const role of ["OWNER", "ADMIN", "SELLER", undefined]) {
      const items = visibleNav(role, ALL);
      const last = items[items.length - 1];
      expect("divider" in last).toBe(false);
      expect("section" in last).toBe(false);
    }
  });

  it("dá as oportunidades a todos os papéis", () => {
    // A leitura é de QUEM ABRE (o backend prende a carteira ao token), então
    // não há papel a esconder — o vendedor é justamente quem mais precisa dela.
    for (const role of ["OWNER", "ADMIN", "SELLER"]) {
      expect(hrefs(role)).toContain("/opportunities");
    }
  });

  it("não aponta mais para /insights (ela redireciona)", () => {
    for (const role of ["OWNER", "ADMIN", "SELLER"]) {
      expect(hrefs(role)).not.toContain("/insights");
    }
  });

  it("dá a central de pendências a todos os papéis e planos", () => {
    // É a lista de trabalho de quem abre — o vendedor vê as dele, o gestor as
    // da empresa — e nenhuma das quatro leituras depende de recurso de plano.
    for (const role of ["OWNER", "ADMIN", "SELLER"]) {
      expect(hrefs(role)).toContain("/pending");
      expect(hrefs(role, [])).toContain("/pending");
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
    expect(semRotina).not.toContain("/agenda");
    expect(semRotina).toContain("/commissions");
    expect(semRotina).toContain("/goals");
  });

  it("mantém as oportunidades em qualquer plano", () => {
    // A leitura é calculada na hora a partir da carteira — não depende do
    // módulo de avisos automáticos, que é o sino.
    expect(hrefs("OWNER", [])).toContain("/opportunities");
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
    expect(labels).not.toContain("Agenda");
  });

  it("não deixa seção órfã quando o plano esvazia o grupo", () => {
    const items = visibleNav("SELLER", []);
    const last = items[items.length - 1];
    expect("divider" in last).toBe(false);
    expect("section" in last).toBe(false);
  });
});
