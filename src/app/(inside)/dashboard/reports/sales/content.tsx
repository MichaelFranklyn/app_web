"use client";

import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";

import { orderStatusLabel } from "@/app/(inside)/_shared/orderStatus";
import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { SalesReportTable } from "./_components/SalesReportTable";
import { SALES_PDF_COLUMNS } from "./pdfColumns";
import { useSalesReport } from "./useSalesReport";
import {
  buildSalesExportRows,
  SALES_EXPORT_HEADERS,
  SALES_SORT_LABELS,
  sumBy,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function SalesReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const {
    kpis,
    kpisLoading,
    chart,
    filterFields,
    tableData,
    fetchAllRows,
    hasRows,
  } = useSalesReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "vendas",
    title: "Vendas do período",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor, os filtros do painel e a
    // ordem da tabela.
    context: [
      ...context,
      ...buildReportContext({
        fields: filterFields,
        values: tableData.inputValues,
        order: tableData.order,
        sortLabels: SALES_SORT_LABELS,
      }),
    ],
    fetchRows: fetchAllRows,
    sheetHeaders: SALES_EXPORT_HEADERS,
    buildSheetRows: (rows) => buildSalesExportRows(rows, orderStatusLabel),
    pdfColumns: SALES_PDF_COLUMNS,
    // O fechamento do PDF é calculado sobre TODAS as linhas baixadas, não sobre
    // os cartões da tela: é o mesmo recorte, e assim o papel fecha consigo mesmo.
    buildKpis: (rows) => [
      { label: "Pedidos faturados", value: String(rows.length) },
      {
        label: "Faturamento",
        value: formatMoney(sumBy(rows, (row) => row.totalAmount)),
      },
      {
        label: "Comissão gerada",
        value: formatMoney(sumBy(rows, (row) => row.commissionAmount)),
      },
    ],
    buildHighlight: (rows) =>
      `${rows.length} pedido(s) · ${formatMoney(sumBy(rows, (row) => row.totalAmount))}`,
    buildTotals: (rows) => ({
      label: "TOTAL",
      byColumn: {
        6: formatMoney(sumBy(rows, (row) => row.totalAmount)),
        7: formatMoney(sumBy(rows, (row) => row.commissionAmount)),
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
        title={chart.title}
        description={chart.description}
        option={chart.option}
        hasData={chart.hasData}
        loading={chart.loading}
        error={chart.error}
        onRetry={chart.refetch}
      />

      <SalesReportTable
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
      />
    </div>
  );
}
