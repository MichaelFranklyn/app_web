/**
 * Converte o número da página (1-based) no cursor `after` do Relay
 * (arrayconnection), no formato que o backend espera. Página 1 = sem cursor.
 */
export const pageToAfter = (page: number, first: number): string | null =>
  page <= 1 ? null : btoa(`arrayconnection:${(page - 1) * first - 1}`);

/**
 * Teto de páginas de qualquer varredura "carregar tudo" (export, mapa de preço,
 * casamento de fotos por SKU). Vive aqui, e não em cada laço, porque o número é
 * uma decisão só: seis cópias com dois valores diferentes (50 num arquivo, 100
 * no vizinho) fazem a mesma lista sair completa numa tela e cortada na outra.
 *
 * É teto de SEGURANÇA, não de negócio: existe para um cursor quebrado
 * (`hasNextPage` sempre `true`) travar o navegador em vez de rodar para sempre.
 * Por isso quem varre precisa dizer se PAROU no teto — ver `isTruncated`. Uma
 * varredura que corta em silêncio faz a tela afirmar que o registro não existe,
 * que é o bug que o guarda de select (`selectPaging.guard.test.ts`) persegue.
 */
export const MAX_SCAN_PAGES = 100;

/**
 * A varredura terminou porque acabaram as páginas, ou porque bateu no teto?
 *
 * `pagesRead` é quantas páginas foram lidas e `hasNextPage` o que a última
 * respondeu. Só é truncado quando as duas coisas valem ao mesmo tempo.
 */
export const isTruncated = (pagesRead: number, hasNextPage: boolean): boolean =>
  pagesRead >= MAX_SCAN_PAGES && hasNextPage;
