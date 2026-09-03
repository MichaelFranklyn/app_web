"use client";

import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { useLazyQuery } from "@apollo/client/react";
import { FileText } from "lucide-react";
import { useState } from "react";

import { COMMISSIONS_PDF_QUERY } from "../../gql";
import { CommissionRow } from "../../interface";
import { exportCommissionsPdf } from "../../pdf";
import { monthLabel, monthReport, YearMonth } from "../../utils";

interface CommissionsPdfResponse {
  commissions_pdf: { rows: CommissionRow[] };
}

interface Props {
  /** Vendedor de quem é o papel; `null` quando é o próprio (vendedor logado). */
  sellerId: string | null;
  month: YearMonth;
  sellerName: string | null;
  /** Enquanto as comissões carregam, não há o que exportar. */
  disabled?: boolean;
}

/**
 * Baixa o fechamento de comissões do mês exibido: o que há a receber, o que já
 * entrou, o previsto e — em seções próprias — os boletos que o cliente pagou no
 * mês e os que viraram calote.
 *
 * As linhas são buscadas no clique, e são TODAS as do vendedor, não as da tela.
 * A tela mostra um mês; as duas seções de boleto seguem a data do boleto, que
 * quase nunca coincide com o mês em que a comissão cai (ver
 * `COMMISSIONS_PDF_QUERY`). Por isso o papel também ignora o painel de filtros:
 * ele é o fechamento do mês inteiro, não um retrato do que está na tela.
 */
export function CommissionsPdfButton({
  sellerId,
  month,
  sellerName,
  disabled = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  // Logo e nome da representação no cabeçalho do documento.
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();
  const [fetchRows] = useLazyQuery<CommissionsPdfResponse>(
    COMMISSIONS_PDF_QUERY,
    { fetchPolicy: "network-only" }
  );

  const handleClick = async () => {
    setBusy(true);
    try {
      const { data } = await fetchRows({ variables: { sellerId } });
      const report = monthReport(data?.commissions_pdf.rows ?? [], month);

      // Um PDF só com o cabeçalho não serve a ninguém — e some com o mês em que
      // havia movimento, que é onde o gestor queria estar.
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
        return;
      }

      await exportCommissionsPdf(report, {
        month,
        sellerName,
        companyName,
        companyLogoUrl,
      });
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível gerar o PDF",
        description: "Tente novamente.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button.Root
      appearance="outline"
      color="neutral"
      size="sm"
      noUppercase
      loading={busy}
      disabled={disabled}
      onClick={handleClick}
    >
      <Button.Icon icon={FileText} />
      <Button.Title>Baixar PDF do mês</Button.Title>
    </Button.Root>
  );
}
