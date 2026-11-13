/**
 * Assinatura da ficha no `_META`.
 *
 * O importador reconhece a planilha por esta string: é o que separa "isto é uma
 * ficha nossa, já sei ler" de "isto é um arquivo qualquer, preciso perguntar as
 * colunas".
 */
// "girus" é do nome antigo da marca e NÃO muda: fichas já baixadas trazem esta
// string, e trocá-la faria o importador deixar de reconhecê-las.
export const ORDER_SHEET_FORMAT = "girus-order-sheet";
