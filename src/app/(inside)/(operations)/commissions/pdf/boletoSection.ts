import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { drawReportTable, ReportColumn } from "@/utils/pdf/table";
import { Pdf } from "@/utils/pdf/theme";

import { CommissionRow } from "../interface";
import { boletoLabel } from "../utils";

/**
 * Colunas das seções de BOLETO (inadimplentes e liquidados).
 *
 * Elas não são agrupadas por fábrica como as de comissão: aqui a pergunta é
 * sobre o cliente ("esse pagou?"), e o mesmo cliente aparece em fábricas
 * diferentes — por isso a fábrica é uma coluna, e não um bloco.
 *
 * O valor do boleto vem ao lado da comissão porque é o par que se confere: a
 * fábrica manda o valor faturado, e a comissão é o percentual dele.
 */
export const BOLETO_COLUMNS: ReportColumn<CommissionRow>[] = [
  { header: "CLIENTE", width: 24, value: (row) => clientName(row.client) },
  { header: "FÁBRICA", width: 11, value: (row) => factoryName(row.factory) },
  {
    header: "PEDIDO",
    width: 8,
    value: (row) => row.orderId.slice(0, 8).toUpperCase(),
  },
  { header: "NOTA", width: 6, value: (row) => row.invoiceNumber ?? "—" },
  {
    header: "PARC.",
    width: 5,
    align: "right",
    value: (row) => String(row.sequence),
  },
  {
    header: "VENCIMENTO",
    width: 8,
    value: (row) => formatDateDMY(row.dueDate ?? undefined) || "—",
  },
  // A situação carrega a data junto ("Não pagou 12/03/2026"): é o pior caso
  // da tabela, e cortá-lo esconderia justamente o quando.
  { header: "SITUAÇÃO", width: 13, value: boletoLabel },
  {
    header: "VALOR BOLETO",
    width: 10,
    align: "right",
    value: (row) => formatMoney(row.installmentAmount),
  },
  {
    header: "COMISSÃO",
    width: 10,
    align: "right",
    bold: true,
    value: (row) => formatMoney(row.amount),
  },
];

/** Soma uma coluna de dinheiro das linhas, para a faixa de totais. */
const sum = (
  rows: CommissionRow[],
  of: (row: CommissionRow) => string
): number => rows.reduce((total, row) => total + Number(of(row)), 0);

/**
 * Uma seção de boletos, com o total do que está em jogo — quanto o cliente
 * deve (ou pagou) e quanta comissão vai junto.
 */
export const drawBoletoSection = (
  pdf: Pdf,
  rows: CommissionRow[],
  startY: number,
  onNewPage: () => number
): number =>
  drawReportTable(pdf, {
    columns: BOLETO_COLUMNS,
    rows,
    startY,
    onNewPage,
    totalsLabel: "TOTAL",
    totals: {
      7: formatMoney(sum(rows, (row) => row.installmentAmount)),
      8: formatMoney(sum(rows, (row) => row.amount)),
    },
  });
