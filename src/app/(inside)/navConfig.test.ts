import { PlanFeature } from "@/services/plan";
import { describe, expect, it } from "vitest";
import { isNavItemActive, settingsHomeHref, visibleNav } from "./navConfig";

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
  it("configurações é UM item, já apontando para a tela final do papel", () => {
    // As telas da área se escolhem no menu interno (settings/navigation.ts).
    // Ir direto evita o redirect de /settings, que mostrava conteúdo em branco.
    const expected = { OWNER: "/settings/company", ADMIN: "/settings/users" };
    for (const [role, href] of Object.entries(expected)) {
      const settings = hrefs(role).filter((h) => h.startsWith("/settings"));
      expect(settings).toEqual([href]);
      expect(sections(role)).not.toContain("Configurações");
    }
  });

  it("o redirect de /settings segue a mesma regra do menu", () => {
    expect(settingsHomeHref("OWNER")).toBe("/settings/company");
    expect(settingsHomeHref("ADMIN")).toBe("/settings/users");
    expect(settingsHomeHref("SELLER")).toBe("/profile");
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

  it("junta oportunidades e pendências numa entrada só", () => {
    // A central (14/11/2026): Oportunidades é uma aba de /priorities, não um
    // item próprio — duas entradas para a mesma central confundiam.
    for (const role of ["OWNER", "ADMIN", "SELLER"]) {
      expect(hrefs(role)).not.toContain("/opportunities");
      expect(hrefs(role)).toContain("/priorities");
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
      expect(hrefs(role)).toContain("/priorities");
      expect(hrefs(role, [])).toContain("/priorities");
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
    expect(semRotina).not.toContain("/schedule");
    expect(semRotina).toContain("/commissions");
    expect(semRotina).toContain("/goals");
  });

  it("mantém a central (com as oportunidades) em qualquer plano", () => {
    // A leitura é calculada na hora a partir da carteira — não depende do
    // módulo de avisos automáticos, que é o sino.
    expect(hrefs("OWNER", [])).toContain("/priorities");
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

describe("visibleNav — configuração inicial", () => {
  const withSetup = (role: string, setupPending: boolean) =>
    visibleNav(role, ALL, setupPending)
      .filter((item) => "href" in item)
      .map((item) => (item as { href: string }).href);

  it("põe o atalho no topo do menu do gestor enquanto está pendente", () => {
    expect(withSetup("OWNER", true)[0]).toBe("/settings/import");
    expect(withSetup("ADMIN", true)[0]).toBe("/settings/import");
  });

  it("some quando a configuração foi concluída", () => {
    expect(withSetup("OWNER", false)).not.toContain("/settings/import");
  });

  it("nunca aparece para o vendedor", () => {
    expect(withSetup("SELLER", true)).not.toContain("/settings/import");
  });
});

describe("isNavItemActive", () => {
  const at = (pathname: string, href: string, isDayRoute = false) =>
    isNavItemActive({ pathname, href, isDayRoute });

  it("marca a Agenda nas rotas de dentro dela", () => {
    expect(at("/schedule", "/schedule")).toBe(true);
    expect(at("/schedule/plan", "/schedule")).toBe(true);
  });

  it("na visão de dia, a Agenda cede o lugar à Rota do dia", () => {
    expect(at("/schedule", "/schedule", true)).toBe(false);
  });

  it("marca o item no detalhe, mas não num prefixo parecido", () => {
    expect(at("/clients/123", "/clients")).toBe(true);
    expect(at("/clientsx", "/clients")).toBe(false);
  });

  it("usa o matchPrefix quando o href aponta para uma aba", () => {
    expect(
      isNavItemActive({
        pathname: "/settings/company",
        href: "/settings",
        matchPrefix: "/settings",
        isDayRoute: false,
      })
    ).toBe(true);
  });
});
