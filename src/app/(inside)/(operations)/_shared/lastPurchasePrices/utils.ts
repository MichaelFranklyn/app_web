/**
 * Variação do preço de agora sobre o que o cliente pagou da última vez, em %.
 * `null` quando falta um dos dois.
 */
export function variationFromLast(
  current: number,
  last: number | null | undefined
): number | null {
  if (!current || !last) return null;
  return ((current - last) / last) * 100;
}
