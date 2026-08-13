import { describe, expect, it } from "vitest";
import { TenantDetail } from "./interface";
import { limitUsage, tenantSituation, trialDaysLeft } from "./utils";

const TODAY = new Date("2026-08-12T15:00:00Z");

const tenant = (partial: Partial<TenantDetail>): TenantDetail =>
  ({
    isActive: true,
    suspensionReason: null,
    trialEndsAt: null,
    ...partial,
  }) as TenantDetail;

describe("trialDaysLeft", () => {
  it("conta dias de calendário, não instantes", () => {
    // "Vence hoje" precisa devolver 0 a qualquer hora do dia — comparando o
    // instante bruto, às 15h já daria negativo.
    expect(trialDaysLeft("2026-08-12T00:00:00Z", TODAY)).toBe(0);
  });

  it("prazo futuro", () => {
    expect(trialDaysLeft("2026-08-20T00:00:00Z", TODAY)).toBe(8);
  });

  it("prazo vencido é negativo", () => {
    expect(trialDaysLeft("2026-08-01T00:00:00Z", TODAY)).toBe(-11);
  });

  it("sem prazo devolve null, que não é vencido", () => {
    expect(trialDaysLeft(null, TODAY)).toBeNull();
  });

  it("data inválida devolve null", () => {
    expect(trialDaysLeft("qualquer coisa", TODAY)).toBeNull();
  });
});

describe("tenantSituation", () => {
  it("suspensa mostra o motivo", () => {
    const s = tenantSituation(
      tenant({ isActive: false, suspensionReason: "inadimplência" }),
      TODAY
    );
    expect(s.tone).toBe("urgente");
    expect(s.label).toBe("Suspensa");
    expect(s.detail).toBe("inadimplência");
  });

  it("suspensão tem precedência sobre o teste", () => {
    const s = tenantSituation(
      tenant({
        isActive: false,
        suspensionReason: "abuso",
        trialEndsAt: "2020-01-01",
      }),
      TODAY
    );
    expect(s.label).toBe("Suspensa");
  });

  it("ativa sem prazo é simplesmente ativa", () => {
    expect(tenantSituation(tenant({}), TODAY)).toMatchObject({
      tone: "ok",
      label: "Ativa",
      detail: null,
    });
  });

  it("teste com folga é ok", () => {
    expect(
      tenantSituation(tenant({ trialEndsAt: "2026-09-30" }), TODAY)
    ).toMatchObject({
      tone: "ok",
      label: "Em teste",
    });
  });

  it("teste acabando vira atenção", () => {
    expect(
      tenantSituation(tenant({ trialEndsAt: "2026-08-16" }), TODAY)
    ).toMatchObject({
      tone: "atencao",
      label: "Em teste",
    });
  });

  it("último dia tem texto próprio", () => {
    expect(
      tenantSituation(tenant({ trialEndsAt: "2026-08-12" }), TODAY).detail
    ).toBe("Último dia do teste.");
  });

  it("teste vencido e ainda ativa é urgente", () => {
    // O login já é recusado pelo backend; o que falta é a decisão comercial.
    const s = tenantSituation(tenant({ trialEndsAt: "2026-08-01" }), TODAY);
    expect(s.tone).toBe("urgente");
    expect(s.label).toBe("Teste vencido");
  });
});

describe("limitUsage", () => {
  it("calcula a fatia usada", () => {
    expect(limitUsage(3, 10)).toEqual({ percent: 30, isOver: false });
  });

  it("sem teto não há barra", () => {
    expect(limitUsage(3, null)).toBeNull();
  });

  it("estourado trava em 100 mas sinaliza", () => {
    // A barra não passa de cheia; quem avisa que passou é a flag.
    expect(limitUsage(12, 10)).toEqual({ percent: 100, isOver: true });
  });

  it("teto zero é tratado como ausência de teto", () => {
    // O backend recusa zero; se algum registro antigo tiver, a tela não divide
    // por zero nem desenha uma barra sem sentido.
    expect(limitUsage(3, 0)).toBeNull();
  });
});
