"use client";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { WalletReportTable } from "./_components/WalletReportTable";
import { WALLET_PDF_COLUMNS } from "./pdfColumns";
import { useWalletReport } from "./useWalletReport";
import {
  buildWalletExportRows,
  summarize,
  WALLET_EXPORT_HEADERS,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function WalletReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const {
    kpis,
    kpisLoading,
    chart,
    rows,
    pageRows,
    scope,
    setScope,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    fetchAllRows,
    hasRows,
  } = useWalletReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "carteira",
    title: "Situação da carteira",
    from: filters.from,
    context,
    fetchRows: fetchAllRows,
    sheetHeaders: WALLET_EXPORT_HEADERS,
    buildSheetRows: buildWalletExportRows,
    pdfColumns: WALLET_PDF_COLUMNS,
    // O fechamento sai das linhas impressas: com uma visão escolhida ("só os
    // parados"), o papel tem de fechar com o que está nele.
    buildKpis: (exported) => {
      const totals = summarize(exported);
      return [
        { label: "Clientes", value: String(totals.clients) },
        { label: "Atrasados", value: String(totals.atRisk) },
        { label: "Parados", value: String(totals.inactive) },
        { label: "Comprado no período", value: totals.amount },
      ];
    },
    buildHighlight: (exported) => {
      const totals = summarize(exported);
      return `${totals.clients} cliente(s) · ${totals.amount} no período`;
    },
    buildTotals: (exported) => ({
      label: "TOTAL",
      byColumn: { 7: summarize(exported).amount },
    }),
  });

  return (
    <div className="flex flex-col gap-12">
      <ReportToolbar
        filters={filters}
        onRangeChange={setRange}
        onSellerChange={setSellerId}
        canSelectSeller={canSelectSeller}
        onExportSheet={exportSheet}
        onExportPdf={exportPdf}
        exportDisabled={!hasRows}
      />

      <ReportKpis items={kpis} loading={kpisLoading} />

      <ReportChartCard
        title="Como a carteira se reparte"
        description="Cada cliente é comparado com o próprio ritmo de compra, não com um prazo fixo."
        option={chart.option}
        hasData={chart.hasData}
        loading={chart.loading}
        error={chart.error}
        onRetry={chart.refetch}
        emptyDescription="Nenhum cliente vinculado na carteira deste recorte."
      />

      <WalletReportTable
        items={pageRows}
        loading={loading}
        scope={scope}
        onScopeChange={setScope}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalItems={rows.length}
      />
    </div>
  );
}
