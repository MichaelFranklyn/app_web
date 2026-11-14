"use client";

import { FilterField, Filters } from "@/components/Filters";
import { ComponentProps } from "react";

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
  /** Parcelas que sobraram, anunciadas ao leitor de tela ao filtrar. */
  resultCount: FiltersProps["resultCount"];
  resultLoading: FiltersProps["resultLoading"];
}

/** Filtro por situação e o painel de filtros da tela. */
export function CommissionsFilterBar({
  tab,
  onTabChange,
  fields,
  values,
  onChange,
  onTextChange,
  resultCount,
  resultLoading,
}: Props) {
  return (
    <div
      // Celular/tablet: as abas de situação na linha inteira e "Filtros" na de
      // baixo, também inteiro. No desktop, abas e "Filtros" numa faixa só.
      className="desktop:flex-row desktop:items-end desktop:gap-16 flex flex-col gap-8"
      data-tour="commissions-tabs"
    >
      <CommissionTabsBar tab={tab} onChange={onTabChange} />
      {/* No desktop o "Filtros" vai para a ponta direita (as abas têm a
          largura delas); abaixo do desktop a coluna estica e ele ocupa a linha. */}
      <div className="desktop:ml-auto">
        <Filters
          fields={fields}
          values={values}
          onChange={onChange}
          onTextChange={onTextChange}
          resultCount={resultCount}
          resultLoading={resultLoading}
          fullWidthBelowDesktop
        />
      </div>
    </div>
  );
}
