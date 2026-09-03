"use client";

import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { CommissionsReportTable } from "./_components/CommissionsReportTable";
import { commissionsPdfColumns } from "./pdfColumns";
import { useCommissionsReport } from "./useCommissionsReport";
import {
  buildCommissionsExportRows,
  commissionsExportHeaders,
  COMMISSIONS_SORT_LABELS,
  splitTotals,
  summarize,
} from "./utils";

interface Props {
  canSelectSeller: boolean;
}

export default function CommissionsReportContent({ canSelectSeller }: Props) {
  const { filters, setRange, setSellerId } = useReportFilters();
  // Quem escolhe vendedor é quem gerencia — e é para ele que a comissão se
  // reparte em duas (o que a fábrica paga à empresa, o que vai ao vendedor).
  const withOffice = canSelectSeller;
  const report = useCommissionsReport(filters, withOffice);
  const { context } = useReportContext(filters);

  const { exportSheet, exportPdf } = useReportExport({
    slug: "comissoes",
    title: "Comissões do período",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor, os filtros do painel e a
    // ordem da tabela — um papel só das parcelas não conferidas tem de dizer que
    // é isso, senão o fechamento do mês parece menor do que é.
    context: [
      ...context,
      ...buildReportContext({
        fields: report.filterFields,
        values: report.inputValues,
        order: report.sort.key
          ? { by: report.sort.key, dir: report.sort.direction }
          : null,
        sortLabels: COMMISSIONS_SORT_LABELS,
      }),
    ],
    fetchRows: report.fetchAllRows,
    sheetHeaders: commissionsExportHeaders(withOffice),
    buildSheetRows: (rows) => buildCommissionsExportRows(rows, withOffice),
    pdfColumns: commissionsPdfColumns(withOffice),
    buildKpis: (rows) => {
      const totals = summarize(rows);
      const split = splitTotals(rows);
      return [
        { label: "A receber", value: formatMoney(totals.receivable) },
        { label: "Já recebido", value: formatMoney(totals.received) },
        { label: "Previsto", value: formatMoney(totals.pending) },
        {
          label: withOffice ? "Comissão da empresa" : "Total do período",
          value: formatMoney(
            totals.receivable + totals.received + totals.pending
          ),
        },
        // O papel do gestor fecha na pergunta dele: quanto sobrou.
        ...(withOffice
          ? [
              {
                label: "Repasse aos vendedores",
                value: formatMoney(split.seller),
              },
              { label: "Fica no escritório", value: formatMoney(split.office) },
            ]
          : []),
      ];
    },
    buildHighlight: (rows) => {
      const totals = summarize(rows);
      return `${rows.length} parcela(s) · a receber ${formatMoney(totals.receivable)}`;
    },
    buildTotals: (rows) => {
      const totals = summarize(rows);
      const split = splitTotals(rows);
      const total = totals.receivable + totals.received + totals.pending;
      return {
        label: "TOTAL",
        // Os índices são os das colunas do PDF (ver `commissionsPdfColumns`): o
        // total cai debaixo do valor que ele soma.
        byColumn: withOffice
          ? {
              7: formatMoney(total),
              8: formatMoney(split.seller),
              9: formatMoney(split.office),
            }
          : { 7: formatMoney(total) },
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

      {withOffice && report.splitChart.hasData && (
        <ReportChartCard
          title="Quanto fica no escritório"
          description="A barra inteira é a comissão que a fábrica paga à empresa; o verde é o que sobra depois do repasse ao vendedor."
          option={report.splitChart.option}
          hasData={report.splitChart.hasData}
          loading={report.splitChart.loading}
          error={report.splitChart.error}
          onRetry={report.splitChart.refetch}
        />
      )}

      <CommissionsReportTable
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
        withOffice={withOffice}
      />
    </div>
  );
}
