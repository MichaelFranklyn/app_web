import { downloadCSV } from "@/utils/format/csv";

/**
 * Planilha modelo da importação de tabela de preço. Os cabeçalhos foram
 * escolhidos para o auto-mapeamento do wizard reconhecer tudo sozinho;
 * as colunas fiscais (MVA/crédito/interna) são opcionais — só para fábricas
 * com ST por substituição tributária. Alíquotas em percentual (3,25 = 3,25%).
 */
const EXAMPLE_HEADERS = [
  "CODIGO",
  "NOME DO PRODUTO",
  "CATEGORIA",
  "UNIDADE",
  "EMBALAGEM",
  "UNIDADES POR EMBALAGEM",
  "NCM",
  "IPI",
  "MVA",
  "ICMS CREDITO",
  "ALIQUOTA INTERNA",
  "PRECO VAREJO",
  "PRECO ATACADO",
];

const EXAMPLE_ROWS = [
  // Produto simples: só IPI, vendido em caixa fechada.
  ["101", "TORNEIRA JARDIM 1/2 BRANCA", "TORNEIRAS", "Peça", "Caixa", "12", "3922.10.00", "3,25", "", "", "", "16,87", "15,18"],
  // Produto com ST por MVA (estilo Ficha Bahia), venda avulsa.
  ["43269", "ABRACADEIRA DE NYLON 2,5X200MM C/100", "ACESSORIOS", "Peça", "Unidade", "1", "3926.90.90", "9,75", "45", "20,5", "20,5", "5,62", "4,69"],
  // Produto sem imposto nenhum.
  ["205", "CHUVEIRO CAMPANHA 1/2 BRANCO", "CHUVEIROS", "Peça", "Caixa", "12", "", "", "", "", "", "125,64", "113,08"],
];

export const downloadExampleSheet = (): void => {
  downloadCSV("modelo-tabela-de-preco.csv", [EXAMPLE_HEADERS, ...EXAMPLE_ROWS]);
};
