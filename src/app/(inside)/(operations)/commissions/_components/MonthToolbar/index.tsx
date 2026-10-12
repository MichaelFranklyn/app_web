"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";

import { MONTH_HELP, PDF_HELP } from "../../help";
import { type CommissionsMonth } from "../../useCommissionsMonth";
import { type CommissionTab, monthLabel } from "../../utils";
import { CommissionsPdfButton } from "../CommissionsPdfButton";
import { MonthNavigator } from "../MonthNavigator";
import { SettlePeriodModal } from "../SettlePeriodModal";

interface Props {
  nav: CommissionsMonth;
  tab: CommissionTab;
  canManage: boolean;
  /** De quem a tela pede as comissões; `null` = a empresa inteira. */
  sellerId: string | null;
  sellerName: string | null;
  isLoading: boolean;
  onChanged: () => void;
}

/** Navegador de mês: controla os totais logo abaixo e o PDF do mês. */
export function MonthToolbar({
  nav,
  tab,
  canManage,
  sellerId,
  sellerName,
  isLoading,
  onChanged,
}: Props) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-16"
      data-tour="commissions-month"
    >
      <div className="flex items-center gap-4">
        <Title variant="heading-sm">
          {tab === "overdue"
            ? "Boletos travados, de todos os vencimentos"
            : `Resumo de ${monthLabel(nav.month)}`}
        </Title>
        <HelpTooltip
          label="Como o mês funciona nesta tela"
          position="right"
          content={MONTH_HELP}
        />
      </div>
      <div className="flex flex-wrap items-center gap-8">
        {canManage && (
          <SettlePeriodModal
            sellerId={sellerId}
            sellerName={sellerName}
            onSettled={onChanged}
          />
        )}
        <div className="flex items-center gap-2" data-tour="commissions-pdf">
          <CommissionsPdfButton
            sellerId={sellerId}
            month={nav.month}
            sellerName={sellerName}
            canManage={canManage}
            disabled={isLoading}
          />
          <HelpTooltip label="O que sai no PDF" content={PDF_HELP} />
        </div>
        <MonthNavigator nav={nav} />
      </div>
    </div>
  );
}
