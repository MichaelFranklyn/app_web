import { formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { SITUATION_LABEL } from "../situation";
import { PurchaseRow } from "./interface";
import { cadenceLabel, idleLabel, lastPurchaseLabel } from "./utils";

/**
 * Colunas do PDF das últimas compras: as MESMAS oito da tela, na mesma ordem.
 *
 * Quem imprime está conferindo contra a tabela, então nada de coluna extra no
 * papel — ela faz a conferência procurar na tela um dado que não está lá. O
 * número do pedido e a cidade ficam só na PLANILHA, que é para cruzar dados, não
 * para conferir.
 *
 * Cliente e fábrica abrem a linha porque juntos são a identidade dela — é o par
 * que se discute com a fábrica. Depois vem a compra (quando e quanto) e, por
 * último, o tempo parado contra o ritmo, que é o argumento da conversa: "faz três
 * meses, e ele costuma comprar todo mês".
 */
export const PURCHASES_PDF_COLUMNS: ReportColumn<PurchaseRow>[] = [
  {
    header: "CLIENTE",
    width: 24,
    value: (row) => row.clientName,
  },
  {
    header: "FÁBRICA",
    width: 15,
    value: (row) => row.factoryName,
    // O mesmo aviso da tela: vínculo desfeito, compra que ficou no histórico.
    sub: (row) => (row.isLinked ? null : "sem vínculo ativo"),
  },
  {
    header: "SITUAÇÃO",
    width: 10,
    bold: true,
    value: (row) => SITUATION_LABEL[row.situation],
  },
  {
    header: "ÚLT. COMPRA",
    width: 9,
    value: (row) => lastPurchaseLabel(row),
  },
  {
    header: "VALOR",
    width: 10,
    align: "right",
    value: (row) =>
      row.lastOrderDate ? formatMoney(row.lastOrderAmount) : "—",
  },
  {
    header: "PARADO HÁ",
    width: 11,
    value: (row) => idleLabel(row),
  },
  {
    header: "RITMO",
    width: 10,
    value: (row) => cadenceLabel(row),
  },
  {
    header: "NO PERÍODO",
    width: 11,
    align: "right",
    bold: true,
    value: (row) => formatMoney(row.periodAmount),
  },
];

/** Índice da coluna de dinheiro do período, para o total cair sob ela. */
export const PERIOD_COLUMN_INDEX = PURCHASES_PDF_COLUMNS.findIndex(
  (column) => column.header === "NO PERÍODO"
);
