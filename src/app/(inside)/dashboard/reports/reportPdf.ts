import { getTodayIso } from "@/utils/format/date";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { drawReportHeader } from "@/utils/pdf/reportHeader";
import { drawReportTable, ReportColumn } from "@/utils/pdf/table";
import { PAGE } from "@/utils/pdf/theme";

import { ReportKpi } from "./interface";
import { drawKpiStrip } from "./pdfKpiStrip";
import { reportFileName } from "./utils";

export interface ReportPdfMeta {
  /** Quem emite o documento — a representação. */
  companyName?: string | null;
  companyLogoUrl?: string | null;
  /** Título na faixa âmbar ("VENDAS DO PERÍODO"). */
  title: string;
  /** Período por extenso + vendedor: o recorte que o papel cobre. */
  context: string[];
  /** Destaque à direita da faixa (o total, a contagem). */
  highlight?: string | null;
  /** Os mesmos números da faixa de KPIs da tela, escritos antes da tabela. */
  kpis?: ReportKpi[];
  /** Base do nome do arquivo: `<slug>-<data inicial>.pdf`. */
  slug: string;
  from: string;
  /** Paisagem quando a tabela tem muitas colunas (o default dos relatórios). */
  orientation?: "portrait" | "landscape";
}

/**
 * Gera e baixa um relatório em PDF: cabeçalho da representação, o recorte
 * escrito, o fechamento em números e a tabela linha-a-linha.
 *
 * Existe uma moldura só para todas as abas porque o documento é o MESMO papel com
 * conteúdo diferente — cada aba entrega apenas suas colunas e suas linhas. Sem
 * isso, cinco geradores iguais divergiriam no primeiro ajuste de layout.
 *
 * A linha do recorte não é decoração: um relatório de um vendedor impresso sem
 * dizer isso passa por "a empresa toda", e é assim que uma reunião discute o
 * número errado.
 */
export const exportReportPdf = async <T>(
  columns: ReportColumn<T>[],
  rows: T[],
  meta: ReportPdfMeta,
  totals?: { label: string; byColumn: Partial<Record<number, string>> }
): Promise<void> => {
  // jspdf é client-only e pesado: entra por import dinâmico, fora do bundle.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: meta.orientation ?? "landscape",
    unit: "pt",
    format: "a4",
  });

  // O recorte da moldura transparente mantém a marca do mesmo tamanho visual dos
  // outros documentos. Logo é enfeite: falhar em carregar não impede o PDF.
  const [companyLogo, girusLogo] = await Promise.all(
    [loadImage(meta.companyLogoUrl), loadGirusLogo()].map((pending) =>
      pending.then(trimTransparent)
    )
  );

  let y = drawReportHeader(pdf, {
    companyName: meta.companyName ?? null,
    companyLogo,
    title: meta.title,
    highlight: meta.highlight ?? null,
    context: meta.context,
    issuedAt: formatDateDMY(getTodayIso()),
  });

  y = drawKpiStrip(pdf, meta.kpis ?? [], y);

  drawReportTable(pdf, {
    columns,
    rows,
    startY: y,
    onNewPage: () => {
      pdf.addPage();
      return PAGE.margin;
    },
    totals: totals?.byColumn,
    totalsLabel: totals?.label,
  });

  drawFooters(pdf, girusLogo);
  pdf.save(reportFileName(meta.slug, meta.from, "pdf"));
};
