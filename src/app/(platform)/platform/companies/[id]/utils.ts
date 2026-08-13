import { parseLocalDate } from "@/utils/format/date";
import { TenantDetail } from "./interface";

/** Pessoas e trilha do tenant cabem numa página só — não há paginação aqui. */
export const USERS_LIMIT = 50;
export const AUDIT_LIMIT = 20;
/** As últimas ações da empresa, só para dar o tom do uso recente. A leitura
 * completa (com filtro e paginação) é a tela de histórico. */
export const ACTIVITY_LIMIT = 12;

/** Rótulos das ações da trilha. O enum vem em inglês do backend porque quem
 * o lê é o SU; a tradução é da tela. */
export const AUDIT_LABEL: Record<string, string> = {
  PROVISION_COMPANY: "Empresa provisionada",
  SUSPEND_COMPANY: "Empresa suspensa",
  REACTIVATE_COMPANY: "Empresa reativada",
  UPDATE_PLAN: "Plano alterado",
  ISSUE_ACCESS_LINK: "Link de acesso emitido",
  IMPERSONATE_USER: "Sessão de suporte iniciada",
};

/**
 * A frase que resume a situação da conta, para o topo da ficha.
 *
 * Estados diferentes pedem respostas diferentes do suporte, e um selo só de
 * "ativa/suspensa" perderia o caso mais acionável: teste com prazo correndo.
 */
export type TenantSituation = {
  tone: "ok" | "atencao" | "urgente";
  label: string;
  detail: string | null;
};

export const tenantSituation = (
  tenant: TenantDetail,
  today: Date = new Date()
): TenantSituation => {
  if (!tenant.isActive) {
    return {
      tone: "urgente",
      label: "Suspensa",
      detail: tenant.suspensionReason,
    };
  }

  const daysLeft = trialDaysLeft(tenant.trialEndsAt, today);
  if (daysLeft !== null) {
    if (daysLeft < 0) {
      // Login já é recusado por `evaluate_company_access`, mas ninguém decidiu
      // suspender — é a fila de trabalho comercial, não um estado saudável.
      return {
        tone: "urgente",
        label: "Teste vencido",
        detail: "O acesso já está bloqueado. Defina um plano ou suspenda.",
      };
    }
    return {
      tone: daysLeft <= 7 ? "atencao" : "ok",
      label: "Em teste",
      detail:
        daysLeft === 0
          ? "Último dia do teste."
          : `Faltam ${daysLeft} dias para o fim do teste.`,
    };
  }

  return { tone: "ok", label: "Ativa", detail: null };
};

/**
 * Dias até o fim do teste. `null` = a empresa não tem prazo definido, que é o
 * estado de todas as contas criadas antes do campo existir. Negativo = vencido.
 *
 * `trialEndsAt` é uma DATA de calendário que o backend guarda como timestamp à
 * meia-noite UTC ("2026-12-31T00:00:00+00:00"). Lê-la com `new Date(...)` e os
 * getters locais joga o dia para trás em qualquer fuso negativo — no Brasil,
 * 31/12 vira 30/12. `parseLocalDate` monta o dia exatamente como informado,
 * que é a mesma leitura que o backend faz em `evaluate_company_access`
 * (`trial_ends_at.date()` contra `today_brt()`).
 */
export const trialDaysLeft = (
  trialEndsAt: string | null,
  today: Date = new Date()
): number | null => {
  if (!trialEndsAt) return null;
  const end = parseLocalDate(trialEndsAt);
  if (!end) return null;

  // Compara DIAS de calendário: pelo instante bruto, "vence hoje à meia-noite"
  // apareceria como vencido em qualquer hora depois dela.
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.round((endDay - todayDay) / 86_400_000);
};

/** Uso do teto contratado. `null` = sem teto, que não é o mesmo que ilimitado
 * atingido — a barra simplesmente não aparece. */
export const limitUsage = (
  used: number,
  limit: number | null
): { percent: number; isOver: boolean } | null => {
  if (limit === null || limit <= 0) return null;
  return {
    percent: Math.min(100, Math.round((used / limit) * 100)),
    isOver: used > limit,
  };
};
