interface NamedClient {
  razaoSocial: string;
  nomeFantasia?: string | null;
}

/**
 * Nome de exibição de um cliente. A razão social é o identificador canônico —
 * é ela que a carteira em /clients destaca e a busca prioriza. O nome fantasia
 * só entra quando não há razão social, e nunca como string vazia.
 */
export const clientDisplayName = (
  client: NamedClient | null | undefined,
  fallback = "Cliente —"
): string => {
  if (!client) return fallback;
  return client.razaoSocial?.trim() || client.nomeFantasia?.trim() || fallback;
};
