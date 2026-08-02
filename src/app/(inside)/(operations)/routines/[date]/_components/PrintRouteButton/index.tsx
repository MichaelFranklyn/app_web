"use client";

import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { Printer } from "lucide-react";
import { useState } from "react";
import { VisitItem } from "../../interface";
import { DayRoutePdfMeta } from "../../pdf";

interface Props {
  date: string;
  /** Paradas presenciais, já na ordem da rota. */
  stops: VisitItem[];
  /** Ligações do dia — saem em bloco separado na folha. */
  remoteStops: VisitItem[];
  sellerName: string | null;
  departureAddress: string | null;
  routeDistanceKm: string;
  routeDurationMin: number;
}

/**
 * Baixa a rota do dia em PDF para imprimir e levar na rua.
 *
 * O gerador entra por import dinâmico no clique: jsPDF pesa mais que a página
 * inteira e quase ninguém imprime toda vez que abre o dia.
 */
export function PrintRouteButton({
  date,
  stops,
  remoteStops,
  sellerName,
  departureAddress,
  routeDistanceKm,
  routeDurationMin,
}: Props) {
  const { toast } = useToast();
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();
  const [isBusy, setIsBusy] = useState(false);

  const isEmpty = stops.length === 0 && remoteStops.length === 0;

  const handlePrint = async () => {
    setIsBusy(true);
    try {
      const meta: DayRoutePdfMeta = {
        date,
        sellerName,
        departureAddress,
        routeDistanceKm,
        routeDurationMin,
        companyName,
        companyLogoUrl,
      };
      const { exportDayRoutePdf } = await import("../../pdf");
      await exportDayRoutePdf(stops, remoteStops, meta);
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
      <Button.Title>Imprimir rota</Button.Title>
    </Button.Root>
  );
}
