"use client";

import { buildReportContext } from "@/utils/pdf/context";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { PurchasesReportTable } from "./_components/PurchasesReportTable";
import { PERIOD_COLUMN_INDEX, PURCHASES_PDF_COLUMNS } from "./pdfColumns";
import { usePurchasesReport } from "./usePurchasesReport";
import {
  buildPurchasesExportRows,
  PURCHASE_SORT_LABELS,
  PURCHASES_EXPORT_HEADERS,
  summarize,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function PurchasesReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  const report = usePurchasesReport(filters);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "ultimas-compras",
    title: "Últimas compras por fábrica",
    from: filters.from,
    // O recorte inteiro vai escrito no papel: período e vendedor (da barra de
    // cima), os filtros do painel e a ordem da tabela. Uma lista só de parados
    // impressa sem dizer isso seria lida como "a carteira toda parou" — e é
    // assim que uma reunião discute o número errado.
    //
    // Os filtros são descritos a partir dos PRÓPRIOS campos do painel, o mesmo
    // caminho da carteira e dos pedidos: filtro novo aparece no papel sozinho.
    context: [
      ...context,
      ...buildReportContext({
        fields: report.filterFields,
        values: report.inputValues,
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: PURCHASE_SORT_LABELS,
      }),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: PURCHASES_EXPORT_HEADERS,
    buildSheetRows: buildPurchasesExportRows,
    pdfColumns: PURCHASES_PDF_COLUMNS,
    // Paisagem: são oito colunas, e em retrato o nome do cliente viraria sigla.
    orientation: "landscape",
    // O fechamento sai das linhas IMPRESSAS, não dos cartões da tela: com um
    // filtro aplicado, o papel tem de fechar com o que está nele.
    buildKpis: (exported) => {
      const totals = summarize(exported);
      return [
        { label: "Cliente × fábrica", value: String(totals.pairs) },
        { label: "Clientes", value: String(totals.clients) },
        {
          label: "Atrasados / parados",
          value: `${totals.atRisk} / ${totals.inactive}`,
        },
        { label: "Comprado no período", value: totals.periodAmount },
      ];
    },
    buildHighlight: (exported) => {
      const totals = summarize(exported);
      return `${totals.pairs} linha(s) · ${totals.clients} cliente(s) em ${totals.factories} fábrica(s)`;
    },
    buildTotals: (exported) => ({
      label: "TOTAL",
      byColumn: { [PERIOD_COLUMN_INDEX]: summarize(exported).periodAmount },
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
        title="Como cada fábrica está sendo atendida"
        description="Os clientes vinculados a cada fábrica, repartidos pela situação de compra NELA."
        option={report.chart.option}
        hasData={report.chart.hasData}
        loading={report.chart.loading}
        error={report.chart.error}
        onRetry={report.chart.refetch}
        emptyDescription="Nenhum cliente vinculado a fábrica alguma neste recorte."
      />

      <PurchasesReportTable
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
