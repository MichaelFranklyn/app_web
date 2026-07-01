import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { PanelHeader } from "@/components/PanelHeader";
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
          <PanelHeader.Eyebrow>Visão Geral</PanelHeader.Eyebrow>
          <PanelHeader.Title>Dashboard</PanelHeader.Title>
          <PanelHeader.Description>{description}</PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
            {canSelectSeller && (
              <div className="desktop:w-[220px] w-full">
                <Input.Select
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
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
