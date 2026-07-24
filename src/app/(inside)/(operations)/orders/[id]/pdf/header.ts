import { LoadedImage } from "@/utils/media";
import {
  COLOR,
  fitLogoPair,
  PAGE,
  Pdf,
  setDraw,
  setFill,
  setText,
  truncate,
} from "./theme";

// Caixa das logos do topo. As imagens chegam recortadas (trimTransparent), sem
// moldura vazia: a altura aqui é a altura VISÍVEL da marca, e não precisa ser
// grande para o documento parecer dele.
const LOGO_MAX_H = 34;
const LOGO_MAX_W = 130;

export interface HeaderData {
  /** "Pedido" ou "Orçamento" — o mesmo documento serve aos dois. */
  docKind: string;
  number: string;
  issuedAt: string;
  companyName: string | null;
  companyLogo: LoadedImage | null;
  factoryName: string;
  factoryLogo: LoadedImage | null;
}

/**
 * Topo do documento: quem emite (representação, à esquerda) e por qual fábrica
 * (à direita) — a leitura que o cliente faz primeiro. Abaixo, uma régua da cor
 * da marca separa o cabeçalho do corpo, e vem o número do documento.
 *
 * Devolve o `y` onde o corpo pode começar.
 */
export const drawHeader = (pdf: Pdf, data: HeaderData): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const right = pageW - PAGE.margin;
  let y = PAGE.margin;

  const logoTop = y;
  let textTop = y;

  // As duas logos saem com a MESMA altura, cada uma na sua proporção.
  const [companyBox, factoryBox] = fitLogoPair(
    data.companyLogo,
    data.factoryLogo,
    LOGO_MAX_W,
    LOGO_MAX_H
  );

  if (data.companyLogo && companyBox) {
    const box = companyBox;
    pdf.addImage(
      data.companyLogo.dataUrl,
      PAGE.margin,
      logoTop,
      box.width,
      box.height
    );
    textTop = logoTop + box.height;
  }

  // Com logo, o nome vira repetição: a marca já identifica quem emite. Ele só
  // aparece quando não há logo, aí ocupando o lugar dela.
  if (data.companyName && !companyBox) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    setText(pdf, COLOR.ink);
    pdf.text(truncate(pdf, data.companyName, 260), PAGE.margin, logoTop + 12);
    textTop = logoTop + 18;
  }

  // Lado direito: a fábrica do pedido.
  let factoryBottom = logoTop;
  if (data.factoryLogo && factoryBox) {
    const box = factoryBox;
    pdf.addImage(
      data.factoryLogo.dataUrl,
      right - box.width,
      logoTop,
      box.width,
      box.height
    );
    factoryBottom = logoTop + box.height;
  }
  if (!factoryBox) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    setText(pdf, COLOR.ink);
    pdf.text(truncate(pdf, data.factoryName, 200), right, logoTop + 12, {
      align: "right",
    });
    factoryBottom = logoTop + 18;
  }

  y = Math.max(textTop, factoryBottom) + 10;

  // Régua da marca.
  setDraw(pdf, COLOR.brand);
  pdf.setLineWidth(1.5);
  pdf.line(PAGE.margin, y, right, y);
  pdf.setLineWidth(0.5);
  y += 24;

  // Faixa com o tipo e o número do documento.
  setFill(pdf, COLOR.brandSoft);
  pdf.roundedRect(PAGE.margin, y - 15, right - PAGE.margin, 34, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  setText(pdf, COLOR.brand);
  pdf.text(
    `${data.docKind.toUpperCase()} ${data.number}`,
    PAGE.margin + 12,
    y + 7
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  setText(pdf, COLOR.muted);
  pdf.text(`Emitido em ${data.issuedAt}`, right - 12, y + 7, {
    align: "right",
  });

  return y + 40;
};
