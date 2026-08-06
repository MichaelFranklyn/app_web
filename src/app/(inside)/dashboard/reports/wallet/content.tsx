"use client";

import { buildReportContext } from "@/utils/pdf/context";

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
  WALLET_SORT_LABELS,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function WalletReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = useWalletReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "carteira",
    title: "Situação da carteira",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor (da barra de cima), os
    // filtros do painel e a ordem da tabela. Uma lista só de parados impressa
    // sem dizer isso seria lida como "a carteira toda parou".
    context: [
      ...context,
      ...buildReportContext({
        fields: report.filterFields,
        values: report.inputValues,
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: WALLET_SORT_LABELS,
      }),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: WALLET_EXPORT_HEADERS,
    buildSheetRows: buildWalletExportRows,
    pdfColumns: WALLET_PDF_COLUMNS,
    // O fechamento sai das linhas impressas: com um filtro aplicado ("só os
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
        exportDisabled={!report.hasRows}
      />

      <ReportKpis items={report.kpis} loading={report.kpisLoading} />

      <ReportChartCard
        title="Como a carteira se reparte"
        description="Cada cliente é comparado com o próprio ritmo de compra, não com um prazo fixo."
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
        emptyDescription="Nenhum cliente vinculado na carteira deste recorte."
      />

      <WalletReportTable
        items={report.pageRows}
        loading={report.loading}
        filterFields={report.filterFields}
        inputValues={report.inputValues}
        setFilter={report.setFilter}
        setFilters={report.setFilters}
        sort={report.sort}
        currentPage={report.currentPage}
        setCurrentPage={report.setCurrentPage}
        totalPages={report.totalPages}
        totalItems={report.rows.length}
      />
    </div>
  );
}
