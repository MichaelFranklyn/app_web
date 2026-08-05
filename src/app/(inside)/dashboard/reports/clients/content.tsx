"use client";

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
  daysSinceOrder,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function ClientsReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const { kpis, kpisLoading, chart, tableData, fetchAllRows, hasRows } =
    useClientsReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "clientes",
    title: "Carteira de clientes",
    from: filters.from,
    // A carteira é um retrato de hoje: dizer isso evita que o papel seja lido
    // como "os clientes do período" — o período só governa o gráfico de atraso.
    context: [...context, "Carteira: retrato de hoje"],
    fetchRows: fetchAllRows,
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
    buildHighlight: (rows) => `${rows.length} cliente(s)`,
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
        title="Quem está mais atrasado para voltar"
        description="Compara cada cliente com o próprio ritmo de compra, no período escolhido. Vermelho passou do dobro do próprio ciclo."
        option={chart.option}
        hasData={chart.hasData}
        loading={chart.loading}
        error={chart.error}
        onRetry={chart.refetch}
        emptyDescription="O atraso é calculado sobre o ritmo de cada cliente, e para isso ele precisa de pelo menos dois pedidos no período."
      />

      <ClientsReportTable
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
