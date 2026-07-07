import { ChartPrintEntry, KpiPrintEntry } from "./analyticsPrintContext";
import { chartFilename } from "./chartCustomize";

export interface PdfMeta {
  title: string;
  subtitle: string;
}

const MARGIN = 40;
const INK = 30;
const MUTED = 120;

/**
 * Monta o PDF da página: cabeçalho (título + período/vendedor), faixa de KPIs e
 * cada gráfico (imagem PNG da instância ECharts) na ordem visual, quebrando
 * páginas conforme necessário. Os gráficos sem imagem (não montaram) são pulados.
 * Retorna o nº de gráficos incluídos.
 */
export const exportAnalyticsPdf = async (
  charts: ChartPrintEntry[],
  kpis: KpiPrintEntry[],
  meta: PdfMeta
): Promise<number> => {
  // Import dinâmico: jspdf é client-only e pesado; sai do bundle inicial/SSR.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN * 2;
  let y = MARGIN;

  // ── Cabeçalho ──
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(INK);
  pdf.text(meta.title, MARGIN, y);
  y += 20;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(MUTED);
  pdf.text(meta.subtitle, MARGIN, y);
  y += 24;

  // ── KPIs (bignumbers) em colunas ──
  if (kpis.length > 0) {
    const colW = contentW / kpis.length;
    kpis.forEach((kpi, i) => {
      const x = MARGIN + colW * i;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(MUTED);
      pdf.text(kpi.label, x, y);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(INK);
      pdf.text(kpi.value, x, y + 16);
    });
    y += 40;
  }

  // ── Gráficos, na ordem visual (top do card) ──
  const ordered = [...charts].sort((a, b) => a.getTop() - b.getTop());
  let included = 0;

  for (const chart of ordered) {
    const img = chart.getImage();
    if (!img) continue;

    const props = pdf.getImageProperties(img);
    const imgH = (contentW * props.height) / props.width;

    // título + gráfico não cabem na página atual? nova página.
    if (y + 16 + imgH > pageH - MARGIN) {
      pdf.addPage();
      y = MARGIN;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(INK);
    pdf.text(chart.title, MARGIN, y);
    y += 10;
    pdf.addImage(img, "JPEG", MARGIN, y, contentW, imgH);
    y += imgH + 24;
    included += 1;
  }

  // Sem nenhum gráfico com dados, não baixa um PDF "vazio" — quem chama avisa.
  if (included === 0) return 0;

  pdf.save(`${chartFilename(meta.title)}.pdf`);
  return included;
};
