"use client";

import { formatMoney } from "@/utils/format/masks";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { BillingReportTable } from "./_components/BillingReportTable";
import { BILLING_PDF_COLUMNS } from "./pdfColumns";
import { useBillingReport } from "./useBillingReport";
import { BILLING_EXPORT_HEADERS, buildBillingExportRows, sumBy } from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function BillingReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const {
    kpis,
    kpisLoading,
    chart,
    pageRows,
    rows,
    scope,
    setScope,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    fetchAllRows,
    hasRows,
  } = useBillingReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "faturamento",
    title: "Duplicatas do período",
    from: filters.from,
    context,
    fetchRows: fetchAllRows,
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
        exportDisabled={!hasRows}
      />

      <ReportKpis items={kpis} loading={kpisLoading} />

      <ReportChartCard
        title="O que vence por fábrica"
        description="A barra inteira é o que está em jogo no período; o vermelho já venceu."
        option={chart.option}
        hasData={chart.hasData}
        loading={chart.loading}
        error={chart.error}
        onRetry={chart.refetch}
      />

      <BillingReportTable
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
