"use client";

import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";

import { formatPercent } from "../../utils";
import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { safeRate } from "../utils";
import { PositivationTable } from "./_components/PositivationTable";
import { buildPositivationPdfColumns, PDF_FACTORY_LIMIT } from "./pdfColumns";
import { usePositivationReport } from "./usePositivationReport";
import {
  buildPositivationExportRows,
  buildPositivationHeaders,
  POSITIVATION_SORT_LABELS,
  summarizeRows,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function PositivationReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = usePositivationReport(filters);
  const { context } = useReportContext(filters);

  const factories = report.report.factories;
  const cutFactories = Math.max(0, factories.length - PDF_FACTORY_LIMIT);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "positivacao",
    title: "Positivação da carteira",
    from: filters.from,
    // O recorte entra no cabeçalho: uma lista só de zerados impressa sem dizer
    // isso seria lida como "a carteira inteira não comprou". Se o PDF cortou
    // colunas, o papel também diz — silêncio aqui pareceria cobertura completa.
    context: [
      ...context,
      ...buildReportContext({
        fields: report.filterFields,
        values: report.inputValues,
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: POSITIVATION_SORT_LABELS,
      }),
      ...(cutFactories > 0
        ? [
            `PDF com as ${PDF_FACTORY_LIMIT} primeiras fábricas (${cutFactories} fora; a planilha traz todas)`,
          ]
        : []),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: buildPositivationHeaders(factories),
    buildSheetRows: (rows) => buildPositivationExportRows(rows, factories),
    pdfColumns: buildPositivationPdfColumns(factories),
    buildKpis: (rows) => {
      const totals = summarizeRows(rows);
      return [
        {
          label: "Clientes no recorte",
          value: String(totals.clients),
        },
        {
          label: "Positivaram",
          value: `${totals.positivated} (${formatPercent(
            safeRate(totals.positivated, totals.clients)
          )})`,
        },
        { label: "Zerados", value: String(totals.zeroed) },
        { label: "Valor no período", value: formatMoney(totals.amount) },
      ];
    },
    buildHighlight: (rows) => {
      const totals = summarizeRows(rows);
      return `${totals.positivated} de ${totals.clients} positivaram`;
    },
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
        title="Positivação por fábrica"
        description="A barra inteira é a carteira vinculada àquela fábrica; o verde é quem comprou no período."
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
        emptyDescription="A positivação parte dos vínculos ativos: sem cliente vinculado a uma fábrica, não há o que medir."
      />

      <PositivationTable
        factories={factories}
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
