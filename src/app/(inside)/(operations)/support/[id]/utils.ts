import {
  SUPPORT_STATUS_LABEL,
  SupportStatus,
  SupportUpdateKind,
} from "@/utils/support";

/**
 * O que o andamento diz na linha do tempo quando ele é uma mudança de situação.
 *
 * A frase é montada do de-para gravado, e não do texto que a pessoa escreveu:
 * é o de-para que responde "quanto tempo isso ficou com a fábrica?".
 */
export const statusChangeLabel = (
  from: SupportStatus | null,
  to: SupportStatus | null
): string | null => {
  if (!to) return null;
  const target = SUPPORT_STATUS_LABEL[to];
  if (!from) return `Passou para ${target}`;
  return `${SUPPORT_STATUS_LABEL[from]} → ${target}`;
};

/** Situações que a pessoa pode escolher ao registrar um andamento. */
export const NEXT_STATUS_OPTIONS: SupportStatus[] = [
  "IN_PROGRESS",
  "WAITING_FACTORY",
  "WAITING_CLIENT",
  "RESOLVED",
  "CANCELLED",
  "OPEN",
];

/** Tipos de andamento que alguém escolhe — `STATUS_CHANGE` é do sistema. */
export const UPDATE_KIND_OPTIONS: SupportUpdateKind[] = [
  "NOTE",
  "CONTACT_CLIENT",
  "CONTACT_FACTORY",
];

/** Encerrar pede a solução por escrito — é o que se relê meses depois. */
export const isClosingStatus = (status: SupportStatus | ""): boolean =>
  status === "RESOLVED" || status === "CANCELLED";
