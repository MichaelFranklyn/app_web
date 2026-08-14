import { PlanFeature, PlanLimitKey } from "@/services/plan";
import { describe, expect, it } from "vitest";
import {
  FeatureAdoption,
  PlanCatalogEntry,
  PlatformEngagement,
  PlatformGrowthPoint,
  PlatformOperation,
  PlatformOverview,
} from "./interface";
import {
  activityLabel,
  activityTone,
  adoptionRate,
  describePlanChange,
  dormantCompanies,
  engagementRate,
  formatChange,
  formatMonthLabel,
  formatDayLabel,
  daysSinceLogin,
  hasGrowthMovement,
  inactiveThisWeek,
  isPartialCell,
  operationLabel,
  positivationRate,
  retentionPercent,
  retentionTone,
  stickinessTone,
  visitCompletionRate,
} from "./utils";

const overview = (partial: Partial<PlatformOverview>): PlatformOverview => ({
  totalCompanies: 10,
  activeCompanies: 8,
  suspendedCompanies: 2,
  trialCompanies: 3,
  newCompaniesInPeriod: 1,
  totalUsers: 40,
  activeUsersInPeriod: 12,
  neverLoggedUsers: 5,
  engagedCompanies: 4,
  totalSellers: 15,
  totalClients: 300,
  totalFactoryLinks: 22,
  totalOrders: 900,
  ordersInPeriod: 30,
  gmvInPeriod: 12345.67,
  ...partial,
});

const point = (partial: Partial<PlatformGrowthPoint>): PlatformGrowthPoint => ({
  month: "2026-08",
  newCompanies: 0,
  newUsers: 0,
  orders: 0,
  gmv: 0,
  ...partial,
});

describe("formatMonthLabel", () => {
  it("encurta para mês/ano de dois dígitos", () => {
    expect(formatMonthLabel("2026-08")).toBe("ago/26");
    expect(formatMonthLabel("2025-01")).toBe("jan/25");
    expect(formatMonthLabel("2025-12")).toBe("dez/25");
  });

  it("mês fora da faixa não quebra o rótulo", () => {
    expect(formatMonthLabel("2026-13")).toBe("13/26");
  });
});

describe("engagementRate", () => {
  it("mede sobre as empresas ATIVAS, não sobre o total", () => {
    // 4 de 8 ativas = 50%. Sobre as 10 totais daria 40%, e a diferença seriam
    // as suspensas — que estão impedidas de entrar por decisão do próprio SU.
    expect(engagementRate(overview({}))).toBe(50);
  });

  it("sem empresa ativa devolve zero em vez de dividir por zero", () => {
    expect(
      engagementRate(overview({ activeCompanies: 0, engagedCompanies: 0 }))
    ).toBe(0);
  });

  it("todas engajadas dá 100", () => {
    expect(
      engagementRate(overview({ activeCompanies: 8, engagedCompanies: 8 }))
    ).toBe(100);
  });
});

describe("dormantCompanies", () => {
  it("é o que sobra das ativas", () => {
    expect(dormantCompanies(overview({}))).toBe(4);
  });

  it("nunca é negativo", () => {
    // Cenário possível na virada da janela: um SU ancorado numa empresa
    // suspensa entra e ela conta como engajada sem contar como ativa.
    expect(
      dormantCompanies(overview({ activeCompanies: 2, engagedCompanies: 5 }))
    ).toBe(0);
  });
});

describe("hasGrowthMovement", () => {
  it("série toda zerada não tem movimento", () => {
    expect(hasGrowthMovement([point({}), point({ month: "2026-07" })])).toBe(
      false
    );
  });

  it("um único mês com pedido já conta", () => {
    expect(hasGrowthMovement([point({}), point({ orders: 3 })])).toBe(true);
  });

  it("empresa nova sem pedido também conta", () => {
    expect(hasGrowthMovement([point({ newCompanies: 1 })])).toBe(true);
  });

  it("série vazia não tem movimento", () => {
    expect(hasGrowthMovement([])).toBe(false);
  });
});

const operation = (partial: Partial<PlatformOperation>): PlatformOperation => ({
  activeClients: 100,
  positivatedClients: 25,
  visitsPlanned: 200,
  visitsDone: 50,
  averageTicket: 3000,
  activeSellers: 4,
  ordersPerSeller: 10,
  ...partial,
});

describe("formatChange", () => {
  it("positivo ganha sinal explícito", () => {
    expect(formatChange(39.5)).toBe("+40%");
  });

  it("negativo mantém o sinal", () => {
    expect(formatChange(-12.4)).toBe("-12%");
  });

  it("sem base de comparação é travessão, não zero", () => {
    // Zero afirmaria estabilidade onde não há o que comparar.
    expect(formatChange(null)).toBe("—");
  });

  it("zero de verdade continua zero", () => {
    expect(formatChange(0)).toBe("0%");
  });
});

describe("positivationRate", () => {
  it("mede quem comprou sobre quem está na carteira", () => {
    expect(positivationRate(operation({}))).toBe(25);
  });

  it("carteira vazia não divide por zero", () => {
    expect(positivationRate(operation({ activeClients: 0 }))).toBe(0);
  });
});

describe("visitCompletionRate", () => {
  it("mede realizadas sobre planejadas", () => {
    expect(visitCompletionRate(operation({}))).toBe(25);
  });

  it("sem rotina planejada devolve zero em vez de NaN", () => {
    expect(
      visitCompletionRate(operation({ visitsPlanned: 0, visitsDone: 0 }))
    ).toBe(0);
  });
});

describe("adoptionRate", () => {
  const feature = (partial: Partial<FeatureAdoption>): FeatureAdoption => ({
    feature: "orders",
    label: "Pedidos",
    tenantsUsing: 3,
    totalTenants: 4,
    ...partial,
  });

  it("fatia dos tenants ativos que usa", () => {
    expect(adoptionRate(feature({}))).toBe(75);
  });

  it("sem tenant ativo devolve zero", () => {
    expect(adoptionRate(feature({ tenantsUsing: 0, totalTenants: 0 }))).toBe(0);
  });

  it("adoção total é 100", () => {
    expect(adoptionRate(feature({ tenantsUsing: 4, totalTenants: 4 }))).toBe(
      100
    );
  });
});

describe("operationLabel", () => {
  it("traduz o que é conhecido", () => {
    expect(operationLabel("invoiceOrder")).toBe("Faturou pedido");
  });

  it("operação sem tradução aparece com o nome cru", () => {
    // Melhor um nome técnico que um rótulo genérico e falso — e o nome cru
    // ainda serve para achar o resolver.
    expect(operationLabel("algumaCoisaNova")).toBe("algumaCoisaNova");
  });
});

describe("formatDayLabel", () => {
  it("encurta para dia/mês", () => {
    expect(formatDayLabel("2026-08-13")).toBe("13/08");
  });

  it("formato inesperado passa direto", () => {
    expect(formatDayLabel("qualquer")).toBe("qualquer");
  });
});

const TODAY = new Date("2026-08-12T12:00:00Z");

describe("daysSinceLogin", () => {
  it("conta os dias cheios desde o último login", () => {
    expect(daysSinceLogin("2026-08-05T12:00:00Z", TODAY)).toBe(7);
  });

  it("login de hoje é zero", () => {
    expect(daysSinceLogin("2026-08-12T08:00:00Z", TODAY)).toBe(0);
  });

  it("nunca logado devolve null, não zero", () => {
    // Distinção que a tela usa: "nunca entrou" é conta que não começou;
    // zero dias seria conta que entrou hoje.
    expect(daysSinceLogin(null, TODAY)).toBeNull();
  });

  it("data inválida devolve null em vez de NaN", () => {
    expect(daysSinceLogin("não é data", TODAY)).toBeNull();
  });

  it("data no futuro não vira negativo", () => {
    expect(daysSinceLogin("2026-09-01T12:00:00Z", TODAY)).toBe(0);
  });
});

describe("activityTone", () => {
  it.each([
    [0, "ok"],
    [7, "ok"],
    [8, "atencao"],
    [30, "atencao"],
    [31, "urgente"],
    [365, "urgente"],
  ])("%i dias → %s", (days, expected) => {
    expect(activityTone(days)).toBe(expected);
  });

  it("nunca logado é neutro, não urgente", () => {
    // Conta recém-provisionada e ainda não usada não é abandono — ela nem
    // começou; pintá-la de vermelho confundiria os dois casos.
    expect(activityTone(null)).toBe("neutral");
  });
});

describe("activityLabel", () => {
  it.each([
    [null, "Nunca entrou"],
    [0, "Hoje"],
    [1, "Ontem"],
    [5, "Há 5 dias"],
  ])("%s → %s", (days, expected) => {
    expect(activityLabel(days as number | null)).toBe(expected);
  });
});

describe("retentionPercent", () => {
  it("arredonda a permanência da célula", () => {
    expect(retentionPercent(3, 8)).toBe(38);
  });

  it("turma vazia não divide por zero", () => {
    expect(retentionPercent(0, 0)).toBe(0);
  });
});

describe("retentionTone", () => {
  it.each([
    [0, "empty"],
    [10, "bad"],
    [30, "weak"],
    [60, "good"],
    [90, "strong"],
  ])("%s%% → %s", (percent, expected) => {
    expect(retentionTone(percent as number)).toBe(expected);
  });

  it("zero é vazio, não o pior tom", () => {
    // Célula sem ninguém não é "quase ninguém": é ausência de dado naquele mês,
    // e pintá-la de vermelho competiria com as células que têm gente saindo.
    expect(retentionTone(0)).toBe("empty");
  });
});

describe("isPartialCell", () => {
  it("marca o mês corrente na turma antiga", () => {
    // A turma de junho, no 2º mês de vida, está em agosto.
    expect(isPartialCell("2026-06", 2, "2026-08")).toBe(true);
  });

  it("marca o mês corrente na turma nova, em outro offset", () => {
    expect(isPartialCell("2026-08", 0, "2026-08")).toBe(true);
  });

  it("atravessa o ano", () => {
    expect(isPartialCell("2025-11", 3, "2026-02")).toBe(true);
  });

  it("mês fechado não é marcado", () => {
    expect(isPartialCell("2026-06", 1, "2026-08")).toBe(false);
  });
});

describe("stickinessTone", () => {
  it.each([
    [45, "ok"],
    [30, "ok"],
    [15, "atencao"],
    [4, "urgente"],
  ])("%s%% → %s", (percent, expected) => {
    expect(stickinessTone(percent as number)).toBe(expected);
  });
});

describe("inactiveThisWeek", () => {
  const engagement = (
    partial: Partial<PlatformEngagement>
  ): PlatformEngagement => ({
    daily: [],
    dailyAverage: 3,
    weeklyActive: 10,
    monthlyActive: 40,
    activeCompanies: 5,
    stickiness: 7.5,
    peakUsers: 8,
    peakDay: "2026-08-12",
    ...partial,
  });

  it("mostra quem sumiu na última semana", () => {
    expect(inactiveThisWeek(engagement({}))).toBe(30);
  });

  it("nunca fica negativo", () => {
    // A janela semanal e a do período são consultas distintas; um empate ou uma
    // borda não pode virar "-1 pessoa sumida".
    expect(
      inactiveThisWeek(engagement({ weeklyActive: 40, monthlyActive: 40 }))
    ).toBe(0);
  });
});

// ─── Efeito de uma troca de plano ─────────────────────────────── //

const catalogEntry = (
  code: string,
  features: PlanFeature[],
  limits: [PlanLimitKey, number | null][]
): PlanCatalogEntry => ({
  code,
  label: code,
  features,
  limits: limits.map(([key, limit]) => ({
    key,
    label: key.toLowerCase(),
    limit,
  })),
});

const BASICO = catalogEntry(
  "basic",
  ["COMMISSIONS", "NOTIFICATIONS"],
  [
    ["USERS", 8],
    ["SELLERS", 3],
  ]
);

const PRO = catalogEntry(
  "pro",
  ["COMMISSIONS", "NOTIFICATIONS", "ROUTINES", "REPORTS"],
  [
    ["USERS", 40],
    ["SELLERS", 15],
  ]
);

describe("describePlanChange", () => {
  it("lista o que a empresa ganha ao subir de plano", () => {
    const change = describePlanChange(BASICO, PRO);
    expect(change.gained).toEqual(["ROUTINES", "REPORTS"]);
    expect(change.lost).toEqual([]);
  });

  it("lista o que ela PERDE ao descer — o lado que gera chamado", () => {
    const change = describePlanChange(PRO, BASICO);
    expect(change.lost).toEqual(["ROUTINES", "REPORTS"]);
    expect(change.gained).toEqual([]);
  });

  it("mostra o antes e o depois de cada teto que muda", () => {
    const change = describePlanChange(BASICO, PRO);
    expect(change.limitChanges).toEqual([
      { key: "USERS", label: "users", from: 8, to: 40, isTighter: false },
      { key: "SELLERS", label: "sellers", from: 3, to: 15, isTighter: false },
    ]);
  });

  it("marca o teto que aperta", () => {
    const change = describePlanChange(PRO, BASICO);
    expect(change.limitChanges.every((l) => l.isTighter)).toBe(true);
  });

  it("sair de 'sem limite' para um número aperta", () => {
    // Comparar os dois como número faria `null` perder para 3 e o downgrade
    // passar despercebido.
    const ilimitado = catalogEntry("enterprise", PRO.features, [
      ["SELLERS", null],
    ]);
    const [change] = describePlanChange(
      ilimitado,
      catalogEntry("pro", PRO.features, [["SELLERS", 15]])
    ).limitChanges;
    expect(change.isTighter).toBe(true);
  });

  it("chegar a 'sem limite' nunca aperta", () => {
    const ilimitado = catalogEntry("enterprise", PRO.features, [
      ["SELLERS", null],
    ]);
    const [change] = describePlanChange(
      catalogEntry("pro", PRO.features, [["SELLERS", 15]]),
      ilimitado
    ).limitChanges;
    expect(change.isTighter).toBe(false);
  });

  it("teto que não muda fica fora da lista", () => {
    const igual = catalogEntry("outro", BASICO.features, [
      ["USERS", 8],
      ["SELLERS", 99],
    ]);
    const change = describePlanChange(BASICO, igual);
    expect(change.limitChanges.map((l) => l.key)).toEqual(["SELLERS"]);
  });

  it("mesmo plano não descreve mudança nenhuma", () => {
    expect(describePlanChange(PRO, PRO)).toEqual({
      gained: [],
      lost: [],
      limitChanges: [],
    });
  });

  it("plano desconhecido dos dois lados não inventa diferença", () => {
    // Acontece com dado legado: a empresa aponta para um código que saiu do
    // catálogo, e `findPlan` devolve nulo.
    expect(describePlanChange(null, PRO).gained).toEqual([]);
    expect(describePlanChange(BASICO, null).lost).toEqual([]);
  });
});
