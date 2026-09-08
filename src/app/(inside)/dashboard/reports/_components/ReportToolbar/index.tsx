"use client";

import { ExportMenu, ExportMenuAction } from "@/components/ExportMenu";
import { Input, SelectOption } from "@/components/Input";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useMemo } from "react";

import {
  DASHBOARD_FACTORIES_QUERY,
  DASHBOARD_SELLERS_QUERY,
} from "../../../gql";
import {
  DashboardFactoriesResponse,
  DashboardSellersResponse,
  SellerOption,
} from "../../../interface";
import { DashboardDateFilter } from "../../../_components/DashboardDateFilter";
import { ReportFilters } from "../../interface";

// Catálogo pequeno carregado por inteiro: `useCompleteList` rebusca pelo
// total se um dia passar da primeira página, em vez de truncar calado.
const EMPTY_INPUT = {};
const getSellers = (d: DashboardSellersResponse) => d.dashboard_sellers;
const getFactories = (d: DashboardFactoriesResponse) => d.dashboard_factories;

const ALL_SELLERS = "__all__";
const ALL_FACTORIES = "__all_factories__";

interface Props {
  filters: ReportFilters;
  onRangeChange: (range: { from: string; to: string }) => void;
  onSellerChange: (sellerId: string | null) => void;
  /**
   * Liga o seletor de fábrica. Opcional porque só a curva ABC recorta por
   * representada hoje — as outras abas não passam a prop e nem carregam a
   * lista, então não pagam a consulta por um filtro que não usam.
   */
  onFactoryChange?: (factoryId: string | null) => void;
  /** Gestor escolhe de quem ver; vendedor já é escopado pelo backend. */
  canSelectSeller: boolean;
  onExportSheet: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  /**
   * Saídas a mais no menu "Exportar", quando a aba tem duas versões do mesmo
   * papel. É o caso das comissões com um vendedor filtrado: a folha do
   * escritório traz a repartição, a do vendedor traz a fatia dele — e a
   * diferença é dinheiro, não formatação.
   */
  extraExportActions?: ExportMenuAction[];
  /** Renomeia as duas saídas padrão quando existe mais de uma versão do papel. */
  sheetLabel?: string;
  pdfLabel?: string;
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
  onFactoryChange,
  canSelectSeller,
  onExportSheet,
  onExportPdf,
  extraExportActions,
  sheetLabel,
  pdfLabel,
  exportDisabled,
}: Props) {
  const sellersQuery = useCompleteList<DashboardSellersResponse>(
    DASHBOARD_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller }
  );
  useQueryErrorToast(
    sellersQuery.error,
    "Não foi possível carregar a lista de vendedores."
  );

  const sellerOptions: SelectOption[] = useMemo(() => {
    // O `?.` precisa estar nos DOIS níveis. Com ele só em `data`, uma resposta
    // que chega sem o campo (erro parcial do GraphQL devolve `data` preenchido e
    // o campo nulo) estoura `Cannot read properties of undefined` DENTRO do
    // useMemo — e um throw no render derruba a tela inteira no error boundary,
    // antes de o `useQueryErrorToast` acima ter chance de mostrar o aviso.
    const sellers: SellerOption[] =
      sellersQuery.data?.dashboard_sellers?.edges.map((edge) => edge.node) ??
      [];
    return [
      { value: ALL_SELLERS, label: "Todos os vendedores" },
      ...sellers.map((seller) => ({ value: seller.id, label: seller.name })),
    ];
  }, [sellersQuery.data]);

  const sellerValue =
    sellerOptions.find(
      (option) => option.value === (filters.sellerId ?? ALL_SELLERS)
    ) ?? sellerOptions[0];

  // A lista de fábricas só é buscada quando a aba oferece o filtro.
  const factoriesQuery = useCompleteList<DashboardFactoriesResponse>(
    DASHBOARD_FACTORIES_QUERY,
    EMPTY_INPUT,
    getFactories,
    { skip: !onFactoryChange }
  );
  useQueryErrorToast(
    factoriesQuery.error,
    "Não foi possível carregar a lista de fábricas."
  );

  const factoryOptions: SelectOption[] = useMemo(() => {
    // `?.` nos dois níveis, pela mesma razão da lista de vendedores acima.
    const nodes = factoriesQuery.data?.dashboard_factories?.edges ?? [];
    const fabricas = nodes
      .map((edge) => edge.node)
      .filter((node) => node.factory !== null)
      .map((node) => ({
        // O id da FÁBRICA, não o do vínculo: é ele que `orders.factory_id`
        // referencia.
        value: node.factory!.id,
        label:
          node.nickname ||
          node.factory!.nomeFantasia ||
          node.factory!.razaoSocial,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return [{ value: ALL_FACTORIES, label: "Todas as fábricas" }, ...fabricas];
  }, [factoriesQuery.data]);

  // Conta as fábricas REAIS (fora a opção "todas"): com uma só, o seletor
  // ocuparia espaço para oferecer uma escolha que não existe. Mesma regra do
  // seletor da aba de desempenho.
  const hasFactoryChoice = factoryOptions.length - 1 > 1;

  const factoryValue =
    factoryOptions.find(
      (option) => option.value === (filters.factoryId ?? ALL_FACTORIES)
    ) ?? factoryOptions[0];

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

      {onFactoryChange && hasFactoryChoice && (
        <div className="desktop:w-[220px] w-full">
          <Input.Select
            size="sm"
            options={factoryOptions}
            value={factoryValue}
            variant="single"
            disabledClear
            placeholder="Fábrica"
            onChange={(val: SelectOption | SelectOption[] | null) => {
              const opt = Array.isArray(val) ? val[0] : val;
              if (!opt) return;
              onFactoryChange(opt.value === ALL_FACTORIES ? null : opt.value);
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
          extraActions={extraExportActions}
          sheetLabel={sheetLabel}
          pdfLabel={pdfLabel}
          disabled={exportDisabled}
        />
      </div>
    </div>
  );
}
