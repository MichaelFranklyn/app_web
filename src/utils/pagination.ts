/**
 * Converte o número da página (1-based) no cursor `after` do Relay
 * (arrayconnection), no formato que o backend espera. Página 1 = sem cursor.
 */
export const pageToAfter = (page: number, first: number): string | null =>
  page <= 1 ? null : btoa(`arrayconnection:${(page - 1) * first - 1}`);
