"use client";

import { ExportMenu } from "@/components/ExportMenu";
import { Input, SelectOption } from "@/components/Input";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { DASHBOARD_SELLERS_QUERY } from "../../../gql";
import { DashboardSellersResponse, SellerOption } from "../../../interface";
import { DashboardDateFilter } from "../../../_components/DashboardDateFilter";
import { ReportFilters } from "../../interface";

const ALL_SELLERS = "__all__";

interface Props {
  filters: ReportFilters;
  onRangeChange: (range: { from: string; to: string }) => void;
  onSellerChange: (sellerId: string | null) => void;
  /** Gestor escolhe de quem ver; vendedor já é escopado pelo backend. */
  canSelectSeller: boolean;
  onExportSheet: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  /** Desliga o exportar quando o relatório está vazio ou ainda carregando. */
  exportDisabled?: boolean;
}

/**
 * A linha de controle que toda aba de relatório repete: o período, o vendedor e
 * o "Exportar".
 *
 * Fica abaixo das abas, e não no cabeçalho da página, porque o recorte pertence
 * ao relatório à vista — e porque o "Exportar" precisa estar do lado dos filtros
 * que definem o que vai sair no arquivo. Cada aba passa as próprias funções de
 * exportação: quem sabe montar a planilha de comissões é a aba de comissões.
 */
export function ReportToolbar({
  filters,
  onRangeChange,
  onSellerChange,
  canSelectSeller,
  onExportSheet,
  onExportPdf,
  exportDisabled,
}: Props) {
  const sellersQuery = useQuery<DashboardSellersResponse>(
    DASHBOARD_SELLERS_QUERY,
    { variables: { input: { first: 200 } }, skip: !canSelectSeller }
  );
  useQueryErrorToast(
    sellersQuery.error,
    "Não foi possível carregar a lista de vendedores."
  );

  const sellerOptions: SelectOption[] = useMemo(() => {
    const sellers: SellerOption[] =
      sellersQuery.data?.dashboard_sellers.edges.map((edge) => edge.node) ?? [];
    return [
      { value: ALL_SELLERS, label: "Todos os vendedores" },
      ...sellers.map((seller) => ({ value: seller.id, label: seller.name })),
    ];
  }, [sellersQuery.data]);

  const sellerValue =
    sellerOptions.find(
      (option) => option.value === (filters.sellerId ?? ALL_SELLERS)
    ) ?? sellerOptions[0];

  return (
    <div className="tablet:flex-row tablet:items-center flex flex-col gap-8">
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
              const option = Array.isArray(val) ? val[0] : val;
              if (!option) return;
              onSellerChange(
                option.value === ALL_SELLERS ? null : option.value
              );
            }}
          />
        </div>
      )}

      <DashboardDateFilter
        value={{ from: filters.from, to: filters.to }}
        onChange={onRangeChange}
      />

      <div className="tablet:ml-auto">
        <ExportMenu
          onExportSheet={onExportSheet}
          onExportPdf={onExportPdf}
          disabled={exportDisabled}
        />
      </div>
    </div>
  );
}
