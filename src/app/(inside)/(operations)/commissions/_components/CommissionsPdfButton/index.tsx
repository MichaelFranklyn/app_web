"use client";

import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { FileText } from "lucide-react";
import { useState } from "react";
import { CommissionRow } from "../../interface";
import { exportCommissionsPdf } from "../../pdf";
import { monthLabel, receivableReport, YearMonth } from "../../utils";

interface Props {
  /** Todas as linhas do vendedor; o recorte do mês é feito aqui. */
  rows: CommissionRow[];
  month: YearMonth;
  sellerName: string | null;
  /** Enquanto as comissões carregam, não há o que exportar. */
  disabled?: boolean;
}

/**
 * Baixa o relatório das comissões A RECEBER no mês exibido, agrupadas por
 * fábrica. Monta o PDF no próprio navegador (jsPDF), sem tráfego extra para o
 * backend — os dados já estão na tela.
 */
export function CommissionsPdfButton({
  rows,
  month,
  sellerName,
  disabled = false,
}: Props) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  // Logo e nome da representação no cabeçalho do documento.
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();

  const handleClick = async () => {
    const report = receivableReport(rows, month);

    // Sem nada a receber, um PDF só com o cabeçalho não serve a ninguém.
    if (report.count === 0) {
      toast({
        variant: "warning",
        title: "Nada a receber neste mês",
        description: `Não há comissões a receber em ${monthLabel(month)}. Use as setas para escolher outro mês.`,
      });
      return;
    }

    setBusy(true);
    try {
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
