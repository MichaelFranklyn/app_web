"use client";

import {
  lensFor,
  type CommissionLens,
} from "@/app/(inside)/_shared/commissions";
import { formatMoney } from "@/utils/format/masks";
import { buildReportContext } from "@/utils/pdf/context";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useMemo } from "react";

import { ReportChartCard } from "../_components/ReportChartCard";
import { ReportKpis } from "../_components/ReportKpis";
import { ReportToolbar } from "../_components/ReportToolbar";
import { useReportContext } from "../useReportContext";
import { useReportExport } from "../useReportExport";
import { useReportFilters } from "../useReportFilters";
import { CommissionsReportTable } from "./_components/CommissionsReportTable";
import { CommissionRow } from "./interface";
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

  // A tela é sempre a do nível de quem olha: o gestor confere o que as fábricas
  // devem, o vendedor vê a fatia dele. A ESCOLHA existe só na exportação, que é
  // o papel que sai da tela e vai para a mão de outra pessoa.
  const officeLens = lensFor("office", canSelectSeller);
  const sellerLens = lensFor("seller", canSelectSeller);

  /**
   * A descrição de uma das versões do papel.
   *
   * Duas folhas, o mesmo desenho e valores diferentes: a linha da ótica entra
   * no contexto do PDF (junto com período e vendedor) porque, impressa, é a
   * única coisa que distingue uma da outra.
   */
  const specFor = (lens: CommissionLens) => ({
    slug: lens.audience === "seller" ? "comissoes-vendedor" : "comissoes",
    title:
      lens.audience === "seller"
        ? "Comissões do período — extrato do vendedor"
        : "Comissões do período",
    from: filters.from,
    // O recorte inteiro no papel: período e vendedor, os filtros do painel e a
    // ordem da tabela — um papel só das parcelas não conferidas tem de dizer que
    // é isso, senão o fechamento do mês parece menor do que é.
    context: [
      ...context,
      lens.caption,
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
    sheetHeaders: commissionsExportHeaders(lens),
    buildSheetRows: (rows: CommissionRow[]) =>
      buildCommissionsExportRows(rows, lens),
    pdfColumns: commissionsPdfColumns(lens),
    buildKpis: (rows: CommissionRow[]) => {
      const totals = summarize(rows);
      const split = splitTotals(rows);
      const isOffice = lens.audience === "office";
      // No extrato, os números de fechamento são os DO VENDEDOR: repetir aqui
      // os totais da empresa seria pôr de volta, no topo do papel, justamente
      // o dinheiro que a folha dele não deve mostrar.
      if (!isOffice && withOffice) {
        return [
          { label: "Repasse do período", value: formatMoney(split.seller) },
          { label: "Parcelas", value: String(rows.length) },
        ];
      }
      return [
        { label: "A receber", value: formatMoney(totals.receivable) },
        { label: "Já recebido", value: formatMoney(totals.received) },
        { label: "Previsto", value: formatMoney(totals.pending) },
        {
          label: isOffice ? "Comissão da empresa" : "Total do período",
          value: formatMoney(
            totals.receivable + totals.received + totals.pending
          ),
        },
        // O papel do gestor fecha na pergunta dele: quanto sobrou.
        ...(isOffice
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
    buildHighlight: (rows: CommissionRow[]) => {
      const totals = summarize(rows);
      if (lens.audience === "seller" && withOffice) {
        const split = splitTotals(rows);
        return `${rows.length} parcela(s) · repasse ${formatMoney(split.seller)}`;
      }
      return `${rows.length} parcela(s) · a receber ${formatMoney(totals.receivable)}`;
    },
    buildTotals: (rows: CommissionRow[]) => {
      const totals = summarize(rows);
      const split = splitTotals(rows);
      const total = totals.receivable + totals.received + totals.pending;
      // Os índices são os das colunas do PDF (ver `commissionsPdfColumns`): o
      // total cai debaixo do valor que ele soma.
      if (lens.audience === "seller") {
        return {
          label: "TOTAL",
          byColumn: {
            7: formatMoney(withOffice ? split.seller : total),
          },
        };
      }
      return {
        label: "TOTAL",
        byColumn: {
          7: formatMoney(total),
          8: formatMoney(split.seller),
          9: formatMoney(split.office),
        },
      };
    },
  });

  const officeExport = useReportExport(specFor(officeLens));
  const sellerExport = useReportExport(specFor(sellerLens));

  // A folha do vendedor só é oferecida com UM vendedor filtrado: um extrato de
  // "todos" misturaria as fatias de pessoas diferentes na mesma soma, que é o
  // oposto do que ele serve para responder.
  const canExportSellerCopy = withOffice && filters.sellerId !== null;

  const extraExportActions = useMemo(
    () =>
      canExportSellerCopy
        ? [
            {
              label: "PDF do vendedor (só a fatia dele)",
              icon: FileText,
              onSelect: sellerExport.exportPdf,
            },
            {
              label: "Planilha do vendedor (.xlsx)",
              icon: FileSpreadsheet,
              onSelect: sellerExport.exportSheet,
            },
          ]
        : [],
    [canExportSellerCopy, sellerExport]
  );

  return (
    <div className="flex flex-col gap-12">
      <ReportToolbar
        filters={filters}
        onRangeChange={setRange}
        onSellerChange={setSellerId}
        canSelectSeller={canSelectSeller}
        onExportSheet={officeExport.exportSheet}
        onExportPdf={officeExport.exportPdf}
        extraExportActions={extraExportActions}
        sheetLabel={
          canExportSellerCopy ? "Planilha do escritório (.xlsx)" : undefined
        }
        pdfLabel={
          canExportSellerCopy
            ? "PDF do escritório (com a repartição)"
            : undefined
        }
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
