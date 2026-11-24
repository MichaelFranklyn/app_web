"use client";

import { Title } from "@/components/Title";

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
      <Title variant="heading-sm">
        {tab === "overdue"
          ? "Boletos travados, de todos os vencimentos"
          : `Resumo de ${monthLabel(nav.month)}`}
      </Title>
      {/* Tablet: "Dar baixa" e "PDF" dividem uma linha meio a meio e o
          navegador de mês fica com a linha de baixo inteira. Celular: um por
          linha — meio a meio em 360px, os rótulos cortavam. */}
      <div className="desktop:flex desktop:flex-wrap desktop:items-center desktop:w-auto tablet:grid-cols-2 grid w-full grid-cols-1 gap-8 [&>*]:min-w-0">
        {canManage && (
          <SettlePeriodModal
            sellerId={sellerId}
            sellerName={sellerName}
            onSettled={onChanged}
          />
        )}
        <div
          data-tour="commissions-pdf"
          className={canManage ? undefined : "tablet:max-desktop:col-span-2"}
        >
          <CommissionsPdfButton
            sellerId={sellerId}
            month={nav.month}
            sellerName={sellerName}
            canManage={canManage}
            disabled={isLoading}
          />
        </div>
        <div className="tablet:max-desktop:col-span-2">
          <MonthNavigator nav={nav} />
        </div>
      </div>
    </div>
  );
}
