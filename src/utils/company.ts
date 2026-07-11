import { clientDisplayName } from "./client";

/**
 * Nome de exibição de uma fábrica/empresa: nome fantasia, com fallback para
 * razão social e, por fim, "—".
 */
export const factoryName = (
  factory?: { nomeFantasia?: string | null; razaoSocial?: string | null } | null
): string => {
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial ?? "—";
};

/**
 * Nome de exibição de um cliente. Delega ao canônico {@link clientDisplayName}
 * (razão social primeiro — o identificador que a carteira e a busca priorizam),
 * apenas mantendo o fallback "—" desta camada. Antes divergia (nome fantasia
 * primeiro), fazendo o mesmo cliente aparecer com nomes diferentes conforme a
 * tela importava um helper ou o outro.
 */
export const clientName = (
  client?: { nomeFantasia?: string | null; razaoSocial?: string | null } | null
): string => clientDisplayName(client, "—");
