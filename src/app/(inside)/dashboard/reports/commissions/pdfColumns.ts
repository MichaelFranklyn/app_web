import { COMMISSION_STATUS_LABEL } from "@/app/(inside)/_shared/commissions";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { CommissionRow } from "./interface";

/**
 * O peso de cada coluna, nas duas versões do papel.
 *
 * Com a repartição são DOZE colunas na mesma folha, e as três de dinheiro
 * carregam o pior caso do sistema ("R$ 124.509,90"). Na primeira tentativa elas herdaram os pesos da versão de dez
 * colunas e saíram todas cortadas — inclusive os cabeçalhos, que é o corte que
 * torna o papel ilegível. O espaço veio de quem tinha folga: cliente, fábrica e
 * vendedor perdem o fim do nome, e nenhum número perde dígito. A nota fiscal
 * NÃO entra nesse corte: ela é a chave pela qual a planilha da fábrica casa com
 * a parcela, e meia nota não casa com nada.
 */
const WIDTH = {
  receiveDate: [11, 11],
  client: [20, 14],
  factory: [15, 9],
  seller: [11, 9],
  invoice: [6, 9],
  sequence: [5, 6],
  installment: [11, 13],
  amount: [10, 13],
  sellerAmount: [0, 11],
  office: [0, 11],
  status: [9, 8],
  reconciled: [5, 6],
} as const;

/**
 * Colunas do PDF de comissões — a ordem em que se confere contra a planilha da
 * fábrica: quando cai, de quem, de qual fábrica, e quanto.
 *
 * Para quem gerencia, o papel abre a comissão em duas: o que a fábrica paga à
 * empresa e o que dela vai para o vendedor.
 *
 * A parcela leva o valor do boleto ao lado da comissão porque é o par que se
 * checa: a fábrica manda o valor faturado, e a comissão é o percentual dele.
 */
export const commissionsPdfColumns = (
  withOffice: boolean
): ReportColumn<CommissionRow>[] => {
  const w = (key: keyof typeof WIDTH) => WIDTH[key][withOffice ? 1 : 0];

  return [
    {
      header: "RECEBIMENTO",
      width: w("receiveDate"),
      value: (row) => (row.receiveDate ? formatDateDMY(row.receiveDate) : "—"),
    },
    {
      header: "CLIENTE",
      width: w("client"),
      value: (row) => clientName(row.client),
    },
    {
      header: "FÁBRICA",
      width: w("factory"),
      value: (row) => factoryName(row.factory),
    },
    {
      header: "VENDEDOR",
      width: w("seller"),
      value: (row) => row.seller?.name ?? "—",
    },
    // A planilha que a fábrica manda vem pela NOTA: sem esta coluna, casar o
    // repasse com a parcela é feito por cliente + valor, no olho.
    {
      header: "NOTA",
      width: w("invoice"),
      value: (row) => row.invoiceNumber ?? "—",
    },
    {
      header: "PARC.",
      width: w("sequence"),
      align: "right",
      value: (row) => String(row.sequence),
    },
    {
      header: "VALOR PARCELA",
      width: w("installment"),
      align: "right",
      value: (row) => formatMoney(row.installmentAmount),
    },
    {
      // "COMISSÃO" e não "COMISSÃO DA EMPRESA": o cabeçalho maior não cabe na
      // coluna, e as duas colunas seguintes já dizem de quem é cada fatia — a
      // faixa de números no topo do papel soletra "Comissão da empresa".
      header: "COMISSÃO",
      width: w("amount"),
      align: "right",
      bold: true,
      value: (row) => formatMoney(row.amount),
    },
    // A repartição só faz sentido para quem enxerga o nível do escritório: na
    // visão do vendedor, a comissão acima JÁ é a fatia dele.
    ...(withOffice
      ? ([
          {
            header: "AO VENDEDOR",
            width: w("sellerAmount"),
            align: "right",
            value: (row) => formatMoney(row.sellerAmount),
          },
          {
            header: "ESCRITÓRIO",
            width: w("office"),
            align: "right",
            bold: true,
            value: (row) =>
              formatMoney(Number(row.amount) - Number(row.sellerAmount)),
          },
        ] as ReportColumn<CommissionRow>[])
      : []),
    {
      header: "SITUAÇÃO",
      width: w("status"),
      value: (row) => COMMISSION_STATUS_LABEL[row.status],
    },
    {
      header: "CONF.",
      width: w("reconciled"),
      value: (row) => (row.isReconciled ? "sim" : "—"),
    },
  ];
};
