"use client";

import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { BillingReportTable } from "./_components/BillingReportTable";
import { BILLING_PDF_COLUMNS } from "./pdfColumns";
import { useBillingReport } from "./useBillingReport";
import {
  BILLING_EXPORT_HEADERS,
  BILLING_SORT_LABELS,
  buildBillingExportRows,
  sumBy,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function BillingReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = useBillingReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "faturamento",
    title: "Duplicatas do período",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor, os filtros do painel e a
    // ordem da tabela — uma lista só de vencidas impressa sem dizer isso seria
    // lida como "o mês inteiro está vencido".
    context: [
      ...context,
      ...buildReportContext({
        fields: report.filterFields,
        values: report.inputValues,
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: BILLING_SORT_LABELS,
      }),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: BILLING_EXPORT_HEADERS,
    buildSheetRows: buildBillingExportRows,
    pdfColumns: BILLING_PDF_COLUMNS,
    // O fechamento do PDF sai das linhas exportadas, e não dos cartões da tela:
    // com uma visão escolhida ("só vencidas") o papel tem de fechar com o que
    // está impresso nele.
    buildKpis: (exported) => [
      { label: "Parcelas", value: String(exported.length) },
      {
        label: "Valor",
        value: formatMoney(sumBy(exported, (row) => row.amount)),
      },
      {
        label: "Vencido",
        value: formatMoney(
          sumBy(
            exported.filter((row) => row.situation === "OVERDUE"),
            (row) => row.amount
          )
        ),
      },
      {
        label: "Comissão",
        value: formatMoney(sumBy(exported, (row) => row.commissionAmount)),
      },
    ],
    buildHighlight: (exported) =>
      `${exported.length} parcela(s) · ${formatMoney(sumBy(exported, (row) => row.amount))}`,
    buildTotals: (exported) => ({
      label: "TOTAL",
      byColumn: {
        7: formatMoney(sumBy(exported, (row) => row.amount)),
        8: formatMoney(sumBy(exported, (row) => row.commissionAmount)),
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
        title="O que vence por fábrica"
        description="A barra inteira é o que está em jogo no período; o vermelho já venceu."
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
      />

      <BillingReportTable
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
