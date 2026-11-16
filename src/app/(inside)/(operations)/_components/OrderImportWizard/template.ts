import { downloadSheet, SheetOutput } from "@/utils/import/writer";

/**
 * Cabeçalho da planilha modelo de itens do pedido. Os nomes casam com o
 * palpite de colunas (`guessMapping`): quem preenche o modelo chega ao passo
 * "Colunas" com tudo já ligado, sem escolher nada.
 *
 * "Quantidade" e não "Quantidade total": em planilha de fábrica, "total" separa
 * unidades de embalagens; aqui só existe uma quantidade, em unidades.
 */
export const ORDER_ITEMS_TEMPLATE_HEADERS = [
  "Código do produto",
  "Quantidade",
  "Preço unitário",
  "IPI (%)",
];

const EXAMPLE_ROWS: SheetOutput = [
  ["ABC-123", 12, 25.9, 0],
  ["XYZ-456", 6, 104.5, 5],
];

/** Aba "Pedido": é o nome que o leitor procura num Excel com várias abas. */
export const downloadOrderItemsTemplate = () =>
  downloadSheet(
    "modelo-importacao-itens-pedido.xlsx",
    [ORDER_ITEMS_TEMPLATE_HEADERS, ...EXAMPLE_ROWS],
    "Pedido"
  );
