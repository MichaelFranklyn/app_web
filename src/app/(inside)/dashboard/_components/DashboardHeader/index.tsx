import { PanelHeader } from "@/components/PanelHeader";
import { DateRangeIso } from "../../interface";
import { formatDateRangeLabel } from "../../utils";
import { DashboardDateFilter } from "../DashboardDateFilter";

interface Props {
  range: DateRangeIso;
  onRangeChange: (range: DateRangeIso) => void;
}

export function DashboardHeader({ range, onRangeChange }: Props) {
  const description = `Período · ${formatDateRangeLabel(range.from, range.to)}`;

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Eyebrow>Visão Geral</PanelHeader.Eyebrow>
          <PanelHeader.Title>Dashboard</PanelHeader.Title>
          <PanelHeader.Description>{description}</PanelHeader.Description>
        </PanelHeader.Left>
        <PanelHeader.Actions>
          <DashboardDateFilter value={range} onChange={onRangeChange} />
        </PanelHeader.Actions>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
