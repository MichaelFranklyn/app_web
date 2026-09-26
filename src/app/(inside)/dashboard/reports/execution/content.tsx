"use client";

import { buildReportContext } from "@/utils/pdf/context";

import { formatPercent } from "../../utils";
import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { ExecutionSellersTable } from "./_components/ExecutionSellersTable";
import { LiftNotice } from "./_components/LiftNotice";
import { EXECUTION_PDF_COLUMNS } from "./pdfColumns";
import { useExecutionReport } from "./useExecutionReport";
import {
  EXECUTION_EXPORT_HEADERS,
  EXECUTION_SORT_LABELS,
  buildExecutionExportRows,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function ExecutionReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = useExecutionReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "execucao-rotina",
    title: "Execução da rotina",
    from: filters.from,
    context: [
      ...context,
      ...buildReportContext({
        fields: [],
        values: {},
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: EXECUTION_SORT_LABELS,
      }),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: EXECUTION_EXPORT_HEADERS,
    buildSheetRows: buildExecutionExportRows,
    pdfColumns: EXECUTION_PDF_COLUMNS,
    buildKpis: () => report.kpis.map(({ label, value }) => ({ label, value })),
    buildHighlight: () =>
      report.report
        ? `${formatPercent(report.report.executionRate)} de execução · ${report.report.planned} visita(s) planejada(s)`
        : "",
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

      {report.report && <LiftNotice report={report.report} />}

      <ReportChartCard
        title="O que aconteceu com cada visita planejada"
        description="Verde e azul são execução. Vermelho é visita que ninguém respondeu em 7 dias e o sistema fechou."
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
      />

      <ExecutionSellersTable
        items={report.rows}
        loading={report.loading}
        sort={report.sort}
      />
    </div>
  );
}
