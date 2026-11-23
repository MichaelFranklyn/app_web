"use client";

import { plural } from "@/utils/format/plural";
import { buildReportContext } from "@/utils/pdf/context";

import { formatPercent } from "../../utils";
import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportEmpty } from "../_components/ReportEmpty";
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
import { isReportEmpty } from "../utils";

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
        ? `${formatPercent(report.report.executionRate)} de execução · ${plural(report.report.planned, "visita planejada", "visitas planejadas")}`
        : "",
  });

  const isEmpty = isReportEmpty({
    loading: report.kpisLoading || report.chart.loading,
    hasRows: report.hasRows,
    chartHasData: report.chart.hasData,
    error: report.chart.error,
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

      {isEmpty ? (
        <ReportEmpty canSelectSeller={canSelectSeller} />
      ) : (
        <>
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
            canSelectSeller={canSelectSeller}
          />

          {/* O vendedor só vê a própria linha: a tabela repetiria os KPIs. */}
          {canSelectSeller && (
            <ExecutionSellersTable
              items={report.rows}
              loading={report.loading}
              sort={report.sort}
            />
          )}
        </>
      )}
    </div>
  );
}
