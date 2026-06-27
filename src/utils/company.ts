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
 * Nome de exibição de um cliente: nome fantasia, com fallback para razão social
 * e, por fim, "—". (Mesma regra de {@link factoryName}.)
 */
export const clientName = (
  client?: { nomeFantasia?: string | null; razaoSocial?: string | null } | null
): string => {
  if (!client) return "—";
  return client.nomeFantasia ?? client.razaoSocial ?? "—";
};
