"use client";

import { formatMoney } from "@/utils/format/masks";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { CommissionsReportTable } from "./_components/CommissionsReportTable";
import { COMMISSIONS_PDF_COLUMNS } from "./pdfColumns";
import { useCommissionsReport } from "./useCommissionsReport";
import {
  buildCommissionsExportRows,
  COMMISSIONS_EXPORT_HEADERS,
  summarize,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function CommissionsReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = useCommissionsReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "comissoes",
    title: "Comissões do período",
    from: filters.from,
    context,
    fetchRows: report.fetchAllRows,
    sheetHeaders: COMMISSIONS_EXPORT_HEADERS,
    buildSheetRows: buildCommissionsExportRows,
    pdfColumns: COMMISSIONS_PDF_COLUMNS,
    buildKpis: (rows) => {
      const totals = summarize(rows);
      return [
        { label: "A receber", value: formatMoney(totals.receivable) },
        { label: "Já recebido", value: formatMoney(totals.received) },
        { label: "Previsto", value: formatMoney(totals.pending) },
        {
          label: "Total do período",
          value: formatMoney(
            totals.receivable + totals.received + totals.pending
          ),
        },
      ];
    },
    buildHighlight: (rows) => {
      const totals = summarize(rows);
      return `${rows.length} parcela(s) · a receber ${formatMoney(totals.receivable)}`;
    },
    buildTotals: (rows) => {
      const totals = summarize(rows);
      return {
        label: "TOTAL",
        byColumn: {
          6: formatMoney(totals.receivable + totals.received + totals.pending),
        },
      };
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
        title="Comissão por fábrica"
        description="A barra inteira é a comissão do período naquela fábrica; as cores dizem em que pé ela está."
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
      />

      <CommissionsReportTable
        items={report.pageRows}
        loading={report.loading}
        currentPage={report.currentPage}
        setCurrentPage={report.setCurrentPage}
        totalPages={report.totalPages}
        totalItems={report.rows.length}
      />
    </div>
  );
}
