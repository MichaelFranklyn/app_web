"use client";

import { PageContent } from "@/components/PageContent";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { DASHBOARD_FACTORIES_QUERY, DASHBOARD_SELLERS_QUERY } from "../gql";
import {
  DashboardFactoriesResponse,
  DashboardSellersResponse,
  DateRangeIso,
  FactoryOption,
  SellerOption,
} from "../interface";
import { formatDateRangeLabel } from "../utils";
import { AnalyticsPrintContext } from "./analyticsPrintContext";
import {
  allChartKeys,
  groupBySection,
  PrintGroup,
  PrintSelection,
} from "./printSelection";
import { useAnalyticsPdf } from "./useAnalyticsPdf";
import { PrintOptionsModal } from "./_components/PrintOptionsModal";
import { AnalyticsHeader } from "./_components/AnalyticsHeader";
import { AnalyticsStoryIndex } from "./_components/AnalyticsStoryIndex";
import { AnalyticsSummary } from "./_components/AnalyticsSummary";
import { ClientPortfolioSection } from "./_components/ClientPortfolioSection";
import { CommissionsSection } from "./_components/CommissionsSection";
import { FactoryServiceSection } from "./_components/FactoryServiceSection";
import { GrowthDriversSection } from "./_components/GrowthDriversSection";
import { PeriodResultSection } from "./_components/PeriodResultSection";
import { RevenueDependencySection } from "./_components/RevenueDependencySection";
import { SalesTeamSection } from "./_components/SalesTeamSection";
import { ChartFilters } from "./interface";
import { getLast12MonthsRangeIso } from "./utils";

// Papéis que enxergam dados de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export default function AnalyticsContent() {
  const initialRange = useMemo(getLast12MonthsRangeIso, []);
  const [range, setRange] = useState<DateRangeIso>(initialRange);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(
    null
  );

  // Cookie é client-only: lido após o mount para evitar mismatch de hidratação.
  const [canSelectSeller, setCanSelectSeller] = useState(false);
  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setCanSelectSeller(MANAGER_ROLES.includes(userData?.role ?? ""));
  }, []);

  const sellersQuery = useQuery<DashboardSellersResponse>(
    DASHBOARD_SELLERS_QUERY,
    {
      variables: { input: { first: 200 } },
      skip: !canSelectSeller,
      fetchPolicy: "cache-and-network",
    }
  );
  useQueryErrorToast(
    sellersQuery.error,
    "Não foi possível carregar a lista de vendedores."
  );
  const sellers: SellerOption[] = useMemo(
    () => sellersQuery.data?.dashboard_sellers?.edges.map((e) => e.node) ?? [],
    [sellersQuery.data]
  );

  // As representadas da empresa, para o recorte por fábrica. Sem `skip`, ao
  // contrário da lista de vendedores: o seletor de fábrica vale para o vendedor
  // também, e a query é `@is_authenticated` (não admin-only).
  const factoriesQuery = useQuery<DashboardFactoriesResponse>(
    DASHBOARD_FACTORIES_QUERY,
    {
      variables: { input: { first: 200 } },
      fetchPolicy: "cache-and-network",
    }
  );
  useQueryErrorToast(
    factoriesQuery.error,
    "Não foi possível carregar a lista de fábricas."
  );
  const factories: FactoryOption[] = useMemo(
    () =>
      (factoriesQuery.data?.dashboard_factories?.edges ?? [])
        .map((e) => e.node)
        // Vínculo sem fábrica é dado inconsistente (ou erro parcial da query):
        // entraria no seletor como uma opção sem nome e sem id utilizável.
        .filter((node) => node.factory !== null)
        .map((node) => ({
          // O id da FÁBRICA, não o do vínculo: é ele que `orders.factory_id`
          // referencia, e mandar o do vínculo filtraria por nada.
          id: node.factory!.id,
          // O apelido do vínculo tem prioridade: é como a casa chama a fábrica.
          name:
            node.nickname ||
            node.factory!.nomeFantasia ||
            node.factory!.razaoSocial,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [factoriesQuery.data]
  );

  // Gestor começa vendo a empresa toda (sellerId null); vendedor é escopado pelo backend.
  const filters: ChartFilters = {
    from: range.from,
    to: range.to,
    sellerId: selectedSellerId,
    factoryId: selectedFactoryId,
  };

  const { contextValue, downloadPdf, isExporting, listCharts } =
    useAnalyticsPdf();

  // O seletor de impressão: as partes/gráficos disponíveis são fotografados ao
  // abrir o modal, e a escolha sobrevive a fechá-lo — quem tira o mesmo recorte
  // duas vezes não remarca trinta caixas de novo. Recarregar a página volta ao
  // padrão (tudo), que é o que se espera de uma tela que começou do zero.
  const [printOpen, setPrintOpen] = useState(false);
  const [printGroups, setPrintGroups] = useState<PrintGroup[]>([]);
  const [selection, setSelection] = useState<PrintSelection | null>(null);

  const openPrintOptions = () => {
    const groups = groupBySection(listCharts());
    setPrintGroups(groups);
    // Primeira abertura: tudo marcado. Nas seguintes, a escolha anterior — menos
    // o gráfico que deixou de existir (o comparativo de vendedores só aparece
    // para o gestor), que sairia da lista mas continuaria "escolhido".
    const available = allChartKeys(groups);
    setSelection((previous) =>
      previous
        ? {
            ...previous,
            charts: previous.charts.filter((key) => available.includes(key)),
          }
        : { charts: available, includeKpis: true }
    );
    setPrintOpen(true);
  };

  const handleDownloadPdf = async () => {
    if (!selection) return;
    const sellerName = selectedSellerId
      ? (sellers.find((s) => s.id === selectedSellerId)?.name ?? "Vendedor")
      : "Todos os vendedores";
    // Com recorte de fábrica o papel TEM de dizer qual: os números impressos são
    // os de uma representada só, e sem a linha o PDF é lido como a empresa
    // inteira — o mesmo motivo pelo qual os relatórios escrevem o recorte no
    // cabeçalho. Sem recorte a linha não entra: "todas as fábricas" seria ruído.
    const factoryName = selectedFactoryId
      ? (factories.find((f) => f.id === selectedFactoryId)?.name ?? "—")
      : null;
    const context = [
      formatDateRangeLabel(range.from, range.to),
      sellerName,
      factoryName && `Fábrica: ${factoryName}`,
    ].filter(Boolean);
    await downloadPdf(
      { title: "Análises", subtitle: context.join(" · ") },
      selection
    );
    setPrintOpen(false);
  };

  return (
    <AnalyticsPrintContext.Provider value={contextValue}>
      <PageContent>
        <AnalyticsHeader
          range={range}
          onRangeChange={setRange}
          canSelectSeller={canSelectSeller}
          sellers={sellers}
          selectedSellerId={selectedSellerId}
          onSelectSeller={setSelectedSellerId}
          factories={factories}
          selectedFactoryId={selectedFactoryId}
          onSelectFactory={setSelectedFactoryId}
          onDownloadPdf={openPrintOptions}
          exportingPdf={isExporting}
        />

        {selection && (
          <PrintOptionsModal
            open={printOpen}
            onOpenChange={setPrintOpen}
            groups={printGroups}
            selection={selection}
            onSelectionChange={setSelection}
            onConfirm={handleDownloadPdf}
            exporting={isExporting}
          />
        )}

        <AnalyticsSummary filters={filters} />
        <AnalyticsStoryIndex />

        {/* A página conta uma história, e a ordem é o argumento (ver
            storyParts.ts): o resultado, o que o explica, de quem ele depende e
            só então as três pessoas por trás dele — cliente, vendedor e
            fábrica. A comissão fecha porque é consequência de todo o resto. */}
        <PeriodResultSection filters={filters} />
        <GrowthDriversSection filters={filters} />
        <RevenueDependencySection filters={filters} />
        <ClientPortfolioSection filters={filters} />
        <SalesTeamSection
          filters={filters}
          canCompareSellers={canSelectSeller}
        />
        <FactoryServiceSection filters={filters} />
        <CommissionsSection
          filters={filters}
          canCompareSellers={canSelectSeller}
        />
      </PageContent>
    </AnalyticsPrintContext.Provider>
  );
}
