"use client";

import { plural } from "@/utils/format/plural";
import { buildReportContext } from "@/utils/pdf/context";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { ClientsReportTable } from "./_components/ClientsReportTable";
import { CLIENTS_PDF_COLUMNS } from "./pdfColumns";
import { useClientsReport } from "./useClientsReport";
import {
  buildClientsExportRows,
  CLIENTS_EXPORT_HEADERS,
  CLIENTS_REPORT_SORT_LABELS,
  daysSinceOrder,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function ClientsReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const {
    kpis,
    kpisLoading,
    chart,
    filterFields,
    tableData,
    fetchAllRows,
    hasRows,
  } = useClientsReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "clientes",
    title: "Carteira de clientes",
    from: filters.from,
    // A carteira é um retrato de hoje: nada aqui depende do período, então a
    // linha "Período" sai do papel (e o filtro sai da tela). Depois vêm os
    // filtros do painel e a ordem da tabela.
    context: [
      ...context.filter((line) => !line.startsWith("Período:")),
      "Carteira: retrato de hoje",
      ...buildReportContext({
        fields: filterFields,
        values: tableData.inputValues,
        order: tableData.order,
        sortLabels: CLIENTS_REPORT_SORT_LABELS,
      }),
    ],
    fetchRows: fetchAllRows,
    // A varredura para no teto de páginas; com o total da tela ao lado, o
    // export avisa quando o arquivo não fecha com ela.
    totalRows: tableData.totalItems,
    sheetHeaders: CLIENTS_EXPORT_HEADERS,
    buildSheetRows: buildClientsExportRows,
    pdfColumns: CLIENTS_PDF_COLUMNS,
    buildKpis: (rows) => {
      const never = rows.filter(
        (row) => !row.companyClient?.lastOrderDate
      ).length;
      const idle = rows.filter((row) => {
        const days = daysSinceOrder(row.companyClient?.lastOrderDate);
        return days !== null && days > 30;
      }).length;
      return [
        { label: "Clientes na carteira", value: String(rows.length) },
        { label: "Sem comprar há mais de 30 dias", value: String(idle) },
        { label: "Nunca compraram", value: String(never) },
      ];
    },
    buildHighlight: (rows) => `${plural(rows.length, "cliente", "clientes")}`,
  });

  return (
    <div className="flex flex-col gap-12">
      <ReportToolbar
        filters={filters}
        onRangeChange={setRange}
        onSellerChange={setSellerId}
        canSelectSeller={canSelectSeller}
        showPeriod={false}
        onExportSheet={exportSheet}
        onExportPdf={exportPdf}
        exportDisabled={!hasRows}
      />

      <ReportKpis items={kpis} loading={kpisLoading} />

      <ReportChartCard
        title="Quem está mais atrasado para voltar"
        description="Compara cada cliente com o próprio ritmo de compra, em todo o histórico. Vermelho passou do dobro do próprio ciclo."
        option={chart.option}
        hasData={chart.hasData}
        loading={chart.loading}
        error={chart.error}
        onRetry={chart.refetch}
        emptyDescription="Nenhum cliente passou do próprio ritmo. O atraso só é medido em quem tem pelo menos dois pedidos."
      />

      <ClientsReportTable
        items={tableData.displayedData}
        loading={tableData.loading}
        currentPage={tableData.currentPage}
        setCurrentPage={tableData.setCurrentPage}
        totalPages={tableData.totalPages}
        totalItems={tableData.totalItems}
        filterFields={filterFields}
        inputValues={tableData.inputValues}
        setFilter={tableData.setFilter}
        setFilters={tableData.setFilters}
        sort={tableData.sort}
        showSeller={canSelectSeller}
      />
    </div>
  );
}
