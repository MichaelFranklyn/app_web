"use client";

import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { FactoriesReportTable } from "./_components/FactoriesReportTable";
import { FACTORIES_PDF_COLUMNS } from "./pdfColumns";
import { useFactoriesReport } from "./useFactoriesReport";
import {
  buildFactoryExportRows,
  FACTORIES_SORT_LABELS,
  FACTORY_EXPORT_HEADERS,
  sumBy,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function FactoriesReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = useFactoriesReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "fabricas",
    title: "Fábricas por pedido",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor, os filtros do painel e a
    // ordem da tabela.
    context: [
      ...context,
      ...buildReportContext({
        fields: report.filterFields,
        values: report.inputValues,
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: FACTORIES_SORT_LABELS,
      }),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: FACTORY_EXPORT_HEADERS,
    buildSheetRows: buildFactoryExportRows,
    pdfColumns: FACTORIES_PDF_COLUMNS,
    buildKpis: (exported) => [
      { label: "Fábricas", value: String(exported.length) },
      {
        label: "Pedidos",
        value: String(sumBy(exported, (row) => row.orderCount)),
      },
      {
        label: "Valor colocado",
        value: formatMoney(sumBy(exported, (row) => row.totalAmount)),
      },
      {
        label: "Já faturado",
        value: formatMoney(sumBy(exported, (row) => row.invoicedAmount)),
      },
    ],
    buildHighlight: (exported) =>
      `${exported.length} fábrica(s) · ${formatMoney(sumBy(exported, (row) => row.totalAmount))}`,
    buildTotals: (exported) => ({
      label: "TOTAL",
      byColumn: {
        1: String(sumBy(exported, (row) => row.orderCount)),
        3: formatMoney(sumBy(exported, (row) => row.totalAmount)),
        5: formatMoney(sumBy(exported, (row) => row.invoicedAmount)),
        6: formatMoney(sumBy(exported, (row) => row.commissionAmount)),
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
        title="Colocado × já faturado"
        description="A distância entre as duas barras é o que ainda não voltou da fábrica."
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
      />

      <FactoriesReportTable
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
