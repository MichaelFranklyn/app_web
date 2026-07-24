import { LoadedImage } from "@/utils/media";
import { COLOR, fitLogo, PAGE, Pdf, setDraw, setText } from "./theme";

// Marca do sistema no rodapé (subiu de 12x54 em 2026-07-24). O teto de altura é
// o que sobra entre a linha do rodapé e a borda da página: com o desenho abaixo
// (`y - height + 6`), 18pt ficam centrados no texto sem cruzar a linha.
const GIRUS_MAX_H = 18;
const GIRUS_MAX_W = 80;

/**
 * Rodapé de todas as páginas: marca do sistema à esquerda e paginação à
 * direita. Desenhado no fim, quando o total de páginas já é conhecido — daí
 * percorrer as páginas em vez de escrever durante o fluxo.
 */
export const drawFooters = (pdf: Pdf, girusLogo: LoadedImage | null): void => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const total = pdf.getNumberOfPages();
  const y = pageH - PAGE.margin + 12;

  for (let page = 1; page <= total; page += 1) {
    pdf.setPage(page);

    setDraw(pdf, COLOR.line);
    pdf.line(PAGE.margin, y - 14, pageW - PAGE.margin, y - 14);

    let textX = PAGE.margin;
    if (girusLogo) {
      const box = fitLogo(girusLogo, GIRUS_MAX_W, GIRUS_MAX_H);
      pdf.addImage(
        girusLogo.dataUrl,
        PAGE.margin,
        y - box.height + 6,
        box.width,
        box.height
      );
      textX = PAGE.margin + box.width + 8;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    setText(pdf, COLOR.muted);
    pdf.text("Documento gerado pelo Girus", textX, y);
    pdf.text(`Página ${page} de ${total}`, pageW - PAGE.margin, y, {
      align: "right",
    });
  }
};
