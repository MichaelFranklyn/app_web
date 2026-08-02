import { LoadedImage } from "@/utils/media";
import {
  COLOR,
  fitLogo,
  PAGE,
  Pdf,
  setDraw,
  setFill,
  setText,
  truncate,
} from "./theme";

// Caixa da logo da representação no topo. A imagem chega recortada
// (trimTransparent), então esta é a altura VISÍVEL da marca.
const LOGO_MAX_H = 44;
const LOGO_MAX_W = 180;

export interface ReportHeaderData {
  companyName: string | null;
  companyLogo: LoadedImage | null;
  /** Título do documento, na faixa âmbar ("CLIENTES DA CARTEIRA"). */
  title: string;
  /** Destaque à direita da faixa — o recorte do documento (mês, aba, total). */
  highlight?: string | null;
  /** Contexto abaixo da faixa: filtros aplicados e quantas linhas o papel cobre. */
  context?: string[];
  issuedAt: string;
}

/**
 * Topo dos relatórios de lista: quem emite (a representação), a faixa com o
 * título e, abaixo, o recorte que o documento cobre.
 *
 * O recorte é o que impede o mal-entendido mais caro desses papéis: uma lista
 * filtrada por vendedor impressa sem dizer isso passa por "a carteira inteira".
 * Por isso os filtros aplicados vêm escritos logo abaixo do título.
 *
 * Devolve o `y` onde o conteúdo pode começar.
 */
export const drawReportHeader = (pdf: Pdf, data: ReportHeaderData): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const right = pageW - PAGE.margin;
  let y = PAGE.margin;
  let markBottom = y;

  if (data.companyLogo) {
    const box = fitLogo(data.companyLogo, LOGO_MAX_W, LOGO_MAX_H);
    pdf.addImage(
      data.companyLogo.dataUrl,
      PAGE.margin,
      y,
      box.width,
      box.height
    );
    markBottom = y + box.height;
  } else if (data.companyName) {
    // Sem logo, o nome ocupa o lugar dela — o documento precisa dizer quem emite.
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    setText(pdf, COLOR.ink);
    pdf.text(truncate(pdf, data.companyName, 260), PAGE.margin, y + 12);
    markBottom = y + 18;
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setText(pdf, COLOR.muted);
  pdf.text(`Emitido em ${data.issuedAt}`, right, y + 10, { align: "right" });

  y = Math.max(markBottom, y + 14) + 14;

  setDraw(pdf, COLOR.brand);
  pdf.setLineWidth(1.5);
  pdf.line(PAGE.margin, y, right, y);
  pdf.setLineWidth(0.5);
  y += 24;

  setFill(pdf, COLOR.brandSoft);
  pdf.roundedRect(PAGE.margin, y - 15, right - PAGE.margin, 34, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  setText(pdf, COLOR.brand);
  pdf.text(data.title.toUpperCase(), PAGE.margin + 12, y + 7);

  if (data.highlight) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    setText(pdf, COLOR.ink);
    pdf.text(data.highlight.toUpperCase(), right - 12, y + 7, {
      align: "right",
    });
  }

  y += 40;

  const context = (data.context ?? []).filter(Boolean);
  if (context.length > 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setText(pdf, COLOR.muted);
    // Uma linha só, separada por ponto médio; se não couber, quebra em duas.
    const lines = pdf.splitTextToSize(
      context.join("  ·  "),
      right - PAGE.margin
    ) as string[];
    lines.forEach((line, index) => pdf.text(line, PAGE.margin, y + index * 12));
    y += (lines.length - 1) * 12;
  }

  return y + 18;
};
