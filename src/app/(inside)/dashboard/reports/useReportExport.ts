"use client";

import { useToast } from "@/components/Toast";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { downloadSheet } from "@/utils/import/writer";
import { useCallback } from "react";

import { ReportKpi } from "./interface";
import { exportReportPdf, ReportPdfMeta } from "./reportPdf";
import { ReportColumn } from "@/utils/pdf/table";
import { reportFileName } from "./utils";

export interface ReportExportSpec<T> {
  /** Nome curto do relatório, usado no arquivo: `vendas-2026-07-01.xlsx`. */
  slug: string;
  /** Título do documento e nome da aba da planilha. */
  title: string;
  /** Primeira data do recorte — entra no nome do arquivo. */
  from: string;
  /** O recorte escrito por extenso (período, vendedor), para o cabeçalho do PDF. */
  context: string[];
  /** Busca TODAS as linhas do recorte (a tela só tem a página atual). */
  fetchRows: () => Promise<T[]>;
  sheetHeaders: string[];
  buildSheetRows: (rows: T[]) => (string | number)[][];
  pdfColumns: ReportColumn<T>[];
  /** Números de fechamento, calculados sobre o conjunto COMPLETO de linhas. */
  buildKpis?: (rows: T[]) => ReportKpi[];
  buildHighlight?: (rows: T[]) => string;
  buildTotals?: (
    rows: T[]
  ) => { label: string; byColumn: Partial<Record<number, string>> } | undefined;
  orientation?: ReportPdfMeta["orientation"];
}

/**
 * As duas saídas de um relatório — planilha e PDF — a partir de uma única
 * descrição do que ele é.
 *
 * Concentra o que todas as abas repetiriam: varrer todas as páginas, avisar
 * quando não há nada para exportar e não deixar um erro de rede virar um arquivo
 * vazio (baixar um PDF de zero linhas é pior do que não baixar, porque parece
 * que o mês não teve venda).
 */
export const useReportExport = <T>(spec: ReportExportSpec<T>) => {
  const { toast } = useToast();
  const { name: companyName, logoUrl: companyLogoUrl } = useCompanyBranding();

  const run = useCallback(
    async (write: (rows: T[]) => Promise<void>) => {
      try {
        const rows = await spec.fetchRows();
        if (rows.length === 0) {
          toast({
            variant: "error",
            title: "Nada para exportar",
            description: "Nenhuma linha no período e no recorte escolhidos.",
          });
          return;
        }
        await write(rows);
      } catch {
        toast({
          variant: "error",
          title: "Não foi possível exportar",
          description: "Tente novamente em instantes.",
        });
      }
    },
    [spec, toast]
  );

  const exportSheet = useCallback(
    () =>
      run(async (rows) =>
        downloadSheet(
          reportFileName(spec.slug, spec.from, "xlsx"),
          [spec.sheetHeaders, ...spec.buildSheetRows(rows)],
          spec.title
        )
      ),
    [run, spec]
  );

  const exportPdf = useCallback(
    () =>
      run(async (rows) =>
        exportReportPdf(
          spec.pdfColumns,
          rows,
          {
            companyName,
            companyLogoUrl,
            title: spec.title,
            context: spec.context,
            highlight: spec.buildHighlight?.(rows) ?? `${rows.length} linha(s)`,
            kpis: spec.buildKpis?.(rows),
            slug: spec.slug,
            from: spec.from,
            orientation: spec.orientation,
          },
          spec.buildTotals?.(rows)
        )
      ),
    [run, spec, companyName, companyLogoUrl]
  );

  return { exportSheet, exportPdf };
};
