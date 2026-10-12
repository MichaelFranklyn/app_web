"use client";

import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { ComponentProps } from "react";

import { FILTERS_HELP } from "../../help";
import { type CommissionTab } from "../../utils";
import { CommissionTabsBar } from "../CommissionTabsBar";

type FiltersProps = ComponentProps<typeof Filters>;

interface Props {
  tab: CommissionTab;
  onTabChange: (tab: CommissionTab) => void;
  fields: FilterField[];
  values: FiltersProps["values"];
  onChange: FiltersProps["onChange"];
  onTextChange: FiltersProps["onTextChange"];
}

/** Filtro por situação e o painel de filtros da tela. */
export function CommissionsFilterBar({
  tab,
  onTabChange,
  fields,
  values,
  onChange,
  onTextChange,
}: Props) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-8"
      data-tour="commissions-tabs"
    >
      <CommissionTabsBar tab={tab} onChange={onTabChange} />
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-2">
          <Filters
            fields={fields}
            values={values}
            onChange={onChange}
            onTextChange={onTextChange}
          />
          <HelpTooltip label="Até onde vão os filtros" content={FILTERS_HELP} />
        </div>
      </div>
    </div>
  );
}
