"use client";

import { plural } from "@/utils/format/plural";
import { orderStatusLabel } from "@/app/(inside)/_shared/orderStatus";
import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportEmpty } from "../_components/ReportEmpty";
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
  SENT_ORDERS_SORT_LABELS,
  summarizeSentOrders,
} from "./utils";
import { isReportEmpty } from "../utils";

interface Props {
  canSelectSeller: boolean;
}

export default function SentOrdersReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const {
    kpis,
    kpisLoading,
    chart,
    filterFields,
    tableData,
    fetchAllRows,
    hasRows,
  } = useSentOrdersReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "pedidos-enviados",
    title: "Pedidos enviados",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor, os filtros do painel e a
    // ordem da tabela.
    context: [
      ...context,
      ...buildReportContext({
        fields: filterFields,
        values: tableData.inputValues,
        order: tableData.order,
        sortLabels: SENT_ORDERS_SORT_LABELS,
      }),
    ],
    fetchRows: fetchAllRows,
    // A varredura para no teto de páginas; com o total da tela ao lado, o
    // export avisa quando o arquivo não fecha com ela.
    totalRows: tableData.totalItems,
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
      return `${plural(totals.count, "pedido", "pedidos")} · ${totals.pendingCount} aguardando`;
    },
    buildTotals: (rows) => ({
      label: "TOTAL",
      byColumn: { 6: formatMoney(summarizeSentOrders(rows).amount) },
    }),
  });

  const isEmpty = isReportEmpty({
    loading: kpisLoading || chart.loading,
    hasRows: hasRows,
    chartHasData: chart.hasData,
    error: chart.error,
    inputValues: tableData.inputValues,
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

      {isEmpty ? (
        <ReportEmpty canSelectSeller={canSelectSeller} />
      ) : (
        <>
          <ReportKpis items={kpis} loading={kpisLoading} />

          <ReportChartCard
            title="Colocado × já faturado, por fábrica"
            description="A barra inteira é o que foi mandado no período; a parte azul é o que a fábrica ainda não faturou."
            option={chart.option}
            hasData={chart.hasData}
            loading={chart.loading}
            error={chart.error}
            onRetry={chart.refetch}
            canSelectSeller={canSelectSeller}
          />

          <SentOrdersTable
            items={tableData.displayedData}
            loading={tableData.loading}
            filterFields={filterFields}
            inputValues={tableData.inputValues}
            setFilter={tableData.setFilter}
            setFilters={tableData.setFilters}
            sort={tableData.sort}
            currentPage={tableData.currentPage}
            setCurrentPage={tableData.setCurrentPage}
            totalPages={tableData.totalPages}
            totalItems={tableData.totalItems}
            showSeller={canSelectSeller}
          />
        </>
      )}
    </div>
  );
}
