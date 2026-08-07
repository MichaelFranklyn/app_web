"use client";

import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { AbcReportTable } from "./_components/AbcReportTable";
import { ABC_PDF_COLUMNS } from "./pdfColumns";
import { useAbcReport } from "./useAbcReport";
import {
  ABC_EXPORT_HEADERS,
  ABC_SORT_LABELS,
  buildAbcExportRows,
  CURVE_CHART_LIMIT,
  summarizeByClass,
  sumBy,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function AbcReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = useAbcReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "curva-abc",
    title: "Curva ABC de clientes",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor, os filtros do painel e a
    // ordem da tabela — uma curva só da classe C impressa sem dizer isso seria
    // lida como a carteira inteira.
    context: [
      ...context,
      ...buildReportContext({
        fields: report.filterFields,
        values: report.inputValues,
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: ABC_SORT_LABELS,
      }),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: ABC_EXPORT_HEADERS,
    buildSheetRows: buildAbcExportRows,
    pdfColumns: ABC_PDF_COLUMNS,
    buildKpis: (exported) => {
      const totals = summarizeByClass(exported);
      return [
        { label: "Clientes", value: String(exported.length) },
        { label: "Classe A", value: String(totals.A.clients) },
        { label: "Classe B", value: String(totals.B.clients) },
        {
          label: "Faturamento",
          value: formatMoney(sumBy(exported, (row) => row.totalAmount)),
        },
      ];
    },
    buildHighlight: (exported) =>
      `${exported.length} cliente(s) · ${formatMoney(sumBy(exported, (row) => row.totalAmount))}`,
    buildTotals: (exported) => ({
      label: "TOTAL",
      byColumn: {
        3: formatMoney(sumBy(exported, (row) => row.totalAmount)),
        7: formatMoney(sumBy(exported, (row) => row.commissionAmount)),
      },
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
        title="Curva de Pareto"
        description={
          report.allRows.length > CURVE_CHART_LIMIT
            ? `Barra: o que cada cliente faturou. Linha: o acumulado. Os ${CURVE_CHART_LIMIT} maiores no gráfico; a lista completa está na tabela.`
            : "Barra: o que cada cliente faturou. Linha: o acumulado — onde ela cruza os 80% está a classe A."
        }
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
      />

      <AbcReportTable
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
