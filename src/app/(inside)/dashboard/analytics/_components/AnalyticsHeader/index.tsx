"use client";

import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { PanelHeader } from "@/components/PanelHeader";
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
}

const ALL_SELLERS = "__all__";

export function AnalyticsHeader({
  range,
  onRangeChange,
  canSelectSeller,
  sellers,
  selectedSellerId,
  onSelectSeller,
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
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
