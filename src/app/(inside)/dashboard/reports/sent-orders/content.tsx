"use client";

import { orderStatusLabel } from "@/app/(inside)/_shared/orderStatus";
import { formatMoney } from "@/utils/format/masks";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { SentOrdersTable } from "./_components/SentOrdersTable";
import { SENT_ORDERS_PDF_COLUMNS } from "./pdfColumns";
import { useSentOrdersReport } from "./useSentOrdersReport";
import {
  buildSentOrdersExportRows,
  SENT_ORDERS_EXPORT_HEADERS,
  summarizeSentOrders,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function SentOrdersReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const { kpis, kpisLoading, chart, tableData, fetchAllRows, hasRows } =
    useSentOrdersReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "pedidos-enviados",
    title: "Pedidos enviados",
    from: filters.from,
    context,
    fetchRows: fetchAllRows,
    sheetHeaders: SENT_ORDERS_EXPORT_HEADERS,
    buildSheetRows: (rows) => buildSentOrdersExportRows(rows, orderStatusLabel),
    pdfColumns: SENT_ORDERS_PDF_COLUMNS,
    buildKpis: (rows) => {
      const totals = summarizeSentOrders(rows);
      return [
        { label: "Pedidos enviados", value: String(totals.count) },
        { label: "Valor colocado", value: formatMoney(totals.amount) },
        {
          label: "Já faturados",
          value: `${totals.invoicedCount} · ${formatMoney(totals.invoicedAmount)}`,
        },
        {
          label: "Aguardando faturamento",
          value: `${totals.pendingCount} · ${formatMoney(totals.pendingAmount)}`,
        },
      ];
    },
    buildHighlight: (rows) => {
      const totals = summarizeSentOrders(rows);
      return `${totals.count} pedido(s) · ${totals.pendingCount} aguardando`;
    },
    buildTotals: (rows) => ({
      label: "TOTAL",
      byColumn: { 6: formatMoney(summarizeSentOrders(rows).amount) },
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
        title="Colocado × já faturado, por fábrica"
        description="A barra inteira é o que foi mandado no período; a parte azul é o que a fábrica ainda não faturou."
        option={chart.option}
        hasData={chart.hasData}
        loading={chart.loading}
        error={chart.error}
        onRetry={chart.refetch}
      />

      <SentOrdersTable
        items={tableData.displayedData}
        loading={tableData.loading}
        currentPage={tableData.currentPage}
        setCurrentPage={tableData.setCurrentPage}
        totalPages={tableData.totalPages}
        totalItems={tableData.totalItems}
      />
    </div>
  );
}
