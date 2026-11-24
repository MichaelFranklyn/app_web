"use client";

import { PanelHeader } from "@/components/PanelHeader";
import { usePathname } from "next/navigation";

import { PendingPeriodScope } from "../PendingPeriodScope";
import { SellerScope } from "../SellerScope";

interface Props {
  canSelectSeller: boolean;
}

/**
 * Os campos do cabeçalho da central. O vendedor vale para as duas abas; o
 * período só existe em Pendências (Oportunidades não tem prazo). Sem campo
 * nenhum — vendedor em Oportunidades —, a faixa nem é desenhada.
 */
export function CentralHeaderActions({ canSelectSeller }: Props) {
  const pathname = usePathname();
  const onPending = pathname === "/priorities";
  if (!canSelectSeller && !onPending) return null;

  return (
    <PanelHeader.Actions>
      {canSelectSeller && <SellerScope />}
      {onPending && <PendingPeriodScope />}
    </PanelHeader.Actions>
  );
}
