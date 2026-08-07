import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { SITUATION_LABEL } from "../situation";
import { WalletRow } from "./interface";
import { cadenceLabel, cityAndState, idleLabel, riskLabel } from "./utils";

/**
 * Colunas do PDF da carteira, na mesma ordem da tela.
 *
 * O papel é levado para a rua: cliente e cidade abrem a linha (é por onde se
 * organiza a visita), a situação vem logo depois e o atraso sobre o próprio
 * ritmo fecha o argumento da ligação.
 */
export const WALLET_PDF_COLUMNS: ReportColumn<WalletRow>[] = [
  {
    header: "CLIENTE",
    width: 26,
    value: (row) => row.clientName,
  },
  {
    header: "CIDADE/UF",
    width: 14,
    value: (row) => cityAndState(row),
  },
  {
    header: "SITUAÇÃO",
    width: 11,
    bold: true,
    value: (row) => SITUATION_LABEL[row.situation],
  },
  {
    header: "PARADO HÁ",
    width: 10,
    value: (row) => idleLabel(row),
  },
  {
    header: "RITMO",
    width: 11,
    value: (row) => cadenceLabel(row),
  },
  {
    header: "ATRASO",
    width: 7,
    align: "right",
    value: (row) => riskLabel(row),
  },
  {
    header: "ÚLT. COMPRA",
    width: 10,
    value: (row) =>
      row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "nunca",
  },
  {
    header: "NO PERÍODO",
    width: 11,
    align: "right",
    value: (row) => formatMoney(row.periodAmount),
  },
];
