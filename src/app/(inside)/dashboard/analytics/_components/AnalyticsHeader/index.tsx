"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { PanelHeader } from "@/components/PanelHeader";
import { FileDown } from "lucide-react";
import { DateRangeIso, SellerOption } from "../../../interface";
import { formatDateRangeLabel } from "../../../utils";
import { DashboardDateFilter } from "../../../_components/DashboardDateFilter";

interface Props {
  range: DateRangeIso;
  onRangeChange: (range: DateRangeIso) => void;
  canSelectSeller: boolean;
  sellers: SellerOption[];
  selectedSellerId: string | null;
  onSelectSeller: (id: string | null) => void;
  onDownloadPdf: () => void;
  exportingPdf: boolean;
}

const ALL_SELLERS = "__all__";

export function AnalyticsHeader({
  range,
  onRangeChange,
  canSelectSeller,
  sellers,
  selectedSellerId,
  onSelectSeller,
  onDownloadPdf,
  exportingPdf,
}: Props) {
  const sellerOptions: SelectOption[] = [
    { value: ALL_SELLERS, label: "Todos os vendedores" },
    ...sellers.map((s) => ({ value: s.id, label: s.name })),
  ];
  const sellerValue =
    sellerOptions.find((o) => o.value === (selectedSellerId ?? ALL_SELLERS)) ??
    sellerOptions[0];

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Eyebrow>Análises</PanelHeader.Eyebrow>
          <PanelHeader.Title>Gráficos</PanelHeader.Title>
          <PanelHeader.Description>
            Desempenho da empresa · {formatDateRangeLabel(range.from, range.to)}
          </PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
            {canSelectSeller && (
              <div className="desktop:w-[220px] w-full">
                <Input.Select
                  size="sm"
                  options={sellerOptions}
                  value={sellerValue}
                  variant="single"
                  disabledClear
                  placeholder="Vendedor"
                  onChange={(val: SelectOption | SelectOption[] | null) => {
                    const opt = Array.isArray(val) ? val[0] : val;
                    if (!opt) return;
                    onSelectSeller(
                      opt.value === ALL_SELLERS ? null : opt.value
                    );
                  }}
                />
              </div>
            )}
            <DashboardDateFilter value={range} onChange={onRangeChange} />
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              loading={exportingPdf}
              onClick={onDownloadPdf}
            >
              <Button.Icon icon={FileDown} />
              <Button.Title>Baixar PDF</Button.Title>
            </Button.Root>
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
