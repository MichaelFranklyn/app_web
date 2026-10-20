"use client";

import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { Printer } from "lucide-react";
import { useState } from "react";
import { useIssueResponseLink } from "../../_shared/responseLink";
import { VisitScheduleDay } from "../../interface";
import type { WeekRoutinePdfMeta } from "../../pdf";

interface Props {
  /** Rotina da semana — é dela que o link de resposta é emitido. */
  scheduleId: string;
  weekStart: string;
  days: VisitScheduleDay[];
  sellerName: string | null;
  /** Dias marcados como não trabalhados — saem na folha como folga. */
  dayOffDates: string[];
}

/**
 * Baixa a rotina da semana em PDF.
 *
 * A folha fecha com o QR do formulário de resposta da SEMANA (mesma lógica da
 * rota do dia): emitido no clique, cada impressão derruba o link anterior da
 * semana. Falha na emissão não cancela a impressão — a folha sai sem o bloco.
 *
 * O gerador entra por import dinâmico no clique: jsPDF pesa mais que a página
 * inteira e quase ninguém imprime toda vez que abre a rotina.
 */
export function PrintWeekButton({
  scheduleId,
  weekStart,
  days,
  sellerName,
  dayOffDates,
}: Props) {
  const { toast } = useToast();
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();
  const [isBusy, setIsBusy] = useState(false);
  const issueLink = useIssueResponseLink({ kind: "week", scheduleId });

  const isEmpty = days.every((day) => day.items.length === 0);

  const handlePrint = async () => {
    setIsBusy(true);
    try {
      const meta: WeekRoutinePdfMeta = {
        weekStart,
        sellerName,
        dayOffDates,
        companyName,
        companyLogoUrl,
        responseUrl: await issueLink().then(
          (link) => link.url,
          () => null
        ),
      };
      const { exportWeekRoutinePdf } = await import("../../pdf");
      await exportWeekRoutinePdf(days, meta);
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível gerar o PDF",
        description: "Tente novamente em instantes.",
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Button.Root
      appearance="outline"
      color="neutral"
      size="sm"
      noUppercase
      disabled={isEmpty}
      loading={isBusy}
      onClick={handlePrint}
    >
      <Button.Icon icon={Printer} />
      <Button.Title>Imprimir semana</Button.Title>
    </Button.Root>
  );
}
