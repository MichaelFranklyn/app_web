import { useToast } from "@/components/Toast";
import { useLazyQuery } from "@apollo/client/react";

import { COMMISSIONS_PDF_QUERY } from "../../gql";
import { CommissionRow } from "../../interface";
import {
  CommissionAudience,
  lensFor,
  monthLabel,
  monthReport,
  pdfVariables,
  YearMonth,
} from "../../utils";

interface CommissionsPdfResponse {
  commissions_pdf: { rows: CommissionRow[] };
}

/**
 * Busca as linhas do mês e monta o fechamento na ótica pedida — o insumo comum
 * de "baixar" e "enviar por email", que precisam do MESMO papel.
 *
 * As linhas são buscadas no clique, e são TODAS as do vendedor, não as da tela:
 * as duas seções de boleto seguem a data do boleto, que quase nunca coincide
 * com o mês em que a comissão cai (ver `COMMISSIONS_PDF_QUERY`).
 *
 * Devolve `null` (e avisa) quando o mês não tem nada: um PDF só com o cabeçalho
 * não serve a ninguém.
 */
export function useMonthReport(
  sellerId: string | null,
  month: YearMonth,
  canManage: boolean
) {
  const { toast } = useToast();
  const [fetchRows] = useLazyQuery<CommissionsPdfResponse>(
    COMMISSIONS_PDF_QUERY,
    { fetchPolicy: "network-only" }
  );

  return async (audience: CommissionAudience) => {
    const { data, error } = await fetchRows({
      variables: pdfVariables(sellerId, month),
    });
    if (error) throw error;
    // A ótica decide o valor, a data e a situação de cada linha — e os
    // rótulos do fechamento.
    const lens = lensFor(audience, canManage);
    const report = monthReport(data?.commissions_pdf.rows ?? [], month, lens);

    if (
      report.count === 0 &&
      report.defaulted.length === 0 &&
      report.settled.length === 0
    ) {
      toast({
        variant: "warning",
        title: "Nada a listar neste mês",
        description: `Não há comissões nem boletos em ${monthLabel(month)}. Use as setas para escolher outro mês.`,
      });
      return null;
    }
    return { report, lens };
  };
}
