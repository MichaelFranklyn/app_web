import { PlatformStaffMember, PlatformStaffRole } from "./interface";

export const STAFF_ROLE_LABEL: Record<PlatformStaffRole, string> = {
  SU: "Super Admin",
  SUPPORT: "Suporte",
};

/**
 * O que cada papel faz, em uma linha.
 *
 * Vive na tela porque é ali que a diferença precisa estar escrita: quem cria
 * uma conta de suporte tem de saber, no momento de criar, que está dando acesso
 * a TODAS as empresas — inclusive para suspender e entrar como usuário.
 */
export const STAFF_ROLE_DESCRIPTION: Record<PlatformStaffRole, string> = {
  SU: "Governa a plataforma e a própria equipe.",
  SUPPORT: "Faz tudo no console, menos criar ou desativar contas da equipe.",
};

export const STAFF_ROLE_COLOR: Record<PlatformStaffRole, "purple" | "blue"> = {
  SU: "purple",
  SUPPORT: "blue",
};

/**
 * Contas de SU não se alteram pela tela.
 *
 * A regra é do backend (`setPlatformUserStatus` recusa alvo com papel de SU); a
 * tela apenas não oferece o botão, para não convidar a um erro que termina em
 * mensagem de recusa. O motivo é o mesmo dos dois lados: dois cliques trancariam
 * a plataforma fora dela mesma.
 */
export const canManage = (
  member: PlatformStaffMember,
  currentUserId?: string
): boolean => member.role !== "SU" && member.id !== currentUserId;

export const formatMoment = (iso: string | null): string => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Quem nunca entrou é diferente de quem entrou há muito tempo: um é conta que
 * não começou, o outro é conta esquecida. A tela distingue os dois. */
export const lastAccessLabel = (member: PlatformStaffMember): string =>
  member.lastLoginAt ? formatMoment(member.lastLoginAt) : "Nunca entrou";
