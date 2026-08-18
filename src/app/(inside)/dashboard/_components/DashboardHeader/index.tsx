"use client";

import { Button } from "@/components/Button";
import { FeatureGate } from "@/components/FeatureGate";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { ChartLine, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateRangeIso, SellerOption } from "../../interface";
import { formatDateRangeLabel } from "../../utils";
import { DashboardDateFilter } from "../DashboardDateFilter";

interface Props {
  range: DateRangeIso;
  onRangeChange: (range: DateRangeIso) => void;
  canSelectSeller: boolean;
  sellers: SellerOption[];
  selectedSellerId: string | null;
  selectedSellerName: string | null;
  onSelectSeller: (id: string) => void;
}

export function DashboardHeader({
  range,
  onRangeChange,
  canSelectSeller,
  sellers,
  selectedSellerId,
  selectedSellerName,
  onSelectSeller,
}: Props) {
  const router = useRouter();
  const periodLabel = `Período · ${formatDateRangeLabel(range.from, range.to)}`;
  const description =
    canSelectSeller && selectedSellerName
      ? `${selectedSellerName} · ${periodLabel}`
      : periodLabel;

  const sellerOptions: SelectOption[] = sellers.map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const sellerValue =
    sellerOptions.find((o) => o.value === selectedSellerId) ?? null;

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Title>Dashboard</PanelHeader.Title>
          <PanelHeader.Description>{description}</PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
            {canSelectSeller && (
              <div className="desktop:w-[220px] w-full">
                <Input.Select
                  size="sm"
                  options={sellerOptions}
                  value={sellerValue}
                  variant="single"
                  disabledClear
                  placeholder="Selecionar vendedor"
                  onChange={(val: SelectOption | SelectOption[] | null) => {
                    const opt = Array.isArray(val) ? val[0] : val;
                    if (opt) onSelectSeller(opt.value);
                  }}
                />
              </div>
            )}
            <DashboardDateFilter value={range} onChange={onRangeChange} />
            {/* As abas "Visão Geral"/"Análises" saíram: eram duas telas
                irmãs disputando um cabeçalho. Daqui se vai para o desempenho e
                para os relatórios, e de lá se volta pelo rastro. */}
            {/* Cada destino é um recurso de plano à parte, e a página de
                lá redireciona quem não tem — botão que leva a um redirect é
                pior do que botão ausente (mesma regra da sidebar). */}
            <FeatureGate feature="ANALYTICS">
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                onClick={() => router.push("/dashboard/analytics")}
              >
                <Button.Icon icon={ChartLine} />
                <Button.Title>Ver desempenho</Button.Title>
              </Button.Root>
            </FeatureGate>
            <FeatureGate feature="REPORTS">
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                onClick={() => router.push("/dashboard/reports")}
              >
                <Button.Icon icon={FileText} />
                <Button.Title>Relatórios</Button.Title>
              </Button.Root>
            </FeatureGate>
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
