import { describe, expect, it } from "vitest";
import { ANNUAL_BILLED_MONTHS, PLANS } from "../plans";
import {
  describeStartError,
  extraUsersFor,
  findPlanByCode,
  isSafeInvoiceUrl,
  START_FALLBACK_MESSAGE,
  toApiCycle,
  totalForCycle,
} from "./utils";

const basic = PLANS.find((plan) => plan.code === "basic")!;
const enterprise = PLANS.find((plan) => plan.code === "enterprise")!;

describe("findPlanByCode", () => {
  it("acha o plano pelo código da URL", () => {
    expect(findPlanByCode("corporate")?.label).toBe("Corporativo");
  });

  it("devolve nulo para código ausente ou desconhecido", () => {
    // Link antigo e `?plano` digitado errado caem aqui, e a página mostra a
    // lista em vez de um checkout sem plano.
    expect(findPlanByCode(null)).toBeNull();
    expect(findPlanByCode("platinum")).toBeNull();
  });
});

describe("totalForCycle", () => {
  it("cobra a mensalidade no ciclo mensal", () => {
    expect(totalForCycle(basic, "monthly")).toBe(basic.demoMonthlyPrice);
  });

  it("cobra menos meses no ciclo anual, sem erro de centavo", () => {
    expect(totalForCycle(basic, "annual")).toBe(
      Math.round(basic.demoMonthlyPrice! * 100 * ANNUAL_BILLED_MONTHS) / 100
    );
  });

  it("soma os usuários a mais à mensalidade e ao anual", () => {
    // Básico (2 inclusos) com 3 usuários: 54,90 + 24,90.
    expect(totalForCycle(basic, "monthly", 3)).toBe(79.8);
    expect(totalForCycle(basic, "annual", 3)).toBe(
      (7980 * ANNUAL_BILLED_MONTHS) / 100
    );
  });

  it("não inventa total para plano sem preço de tabela", () => {
    expect(totalForCycle(enterprise, "monthly")).toBeNull();
  });
});

describe("toApiCycle", () => {
  it("traduz o ciclo da tela para o enum do backend", () => {
    expect(toApiCycle("monthly")).toBe("MONTHLY");
    expect(toApiCycle("annual")).toBe("YEARLY");
  });
});

describe("extraUsersFor", () => {
  it("cobra só os logins além dos inclusos", () => {
    // Básico inclui 2: com 5 usuários, 3 vão à parte.
    expect(extraUsersFor(basic, 5)).toBe(3);
  });

  it("nunca manda número negativo", () => {
    expect(extraUsersFor(basic, 1)).toBe(0);
    expect(extraUsersFor(basic, 2)).toBe(0);
  });
});

describe("describeStartError", () => {
  it("manda entrar quando não há sessão", () => {
    expect(describeStartError("UNAUTHORIZED")).toEqual({ status: "login" });
    expect(describeStartError("Autenticação necessária")).toEqual({
      status: "login",
    });
    expect(describeStartError("Token inválido ou expirado")).toEqual({
      status: "login",
    });
  });

  it("mostra a recusa de negócio como o backend escreveu", () => {
    const message = "A empresa já tem uma assinatura ativa.";
    expect(describeStartError(message)).toEqual({ status: "error", message });
  });

  it("troca erro técnico pelo texto genérico", () => {
    for (const raw of ["", "NETWORK_ERROR: 502", "fetch failed"]) {
      expect(describeStartError(raw)).toEqual({
        status: "error",
        message: START_FALLBACK_MESSAGE,
      });
    }
  });
});

describe("isSafeInvoiceUrl", () => {
  it("só aceita página HTTPS", () => {
    expect(isSafeInvoiceUrl("https://www.asaas.com/i/abc")).toBe(true);
    expect(isSafeInvoiceUrl("http://exemplo.com")).toBe(false);
    expect(isSafeInvoiceUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeInvoiceUrl(null)).toBe(false);
  });
});
