import { LoadedImage } from "@/utils/media";

/** jsPDF trabalha em pontos; A4 = 595 x 842 pt (dobra no paisagem). Margem
 *  comum a todos os documentos do sistema. */
export const PAGE = { margin: 40 };

/** Paleta dos documentos, alinhada aos tokens do sistema (âmbar #c97f0a). */
export const COLOR = {
  ink: [31, 31, 31] as const,
  muted: [122, 122, 122] as const,
  line: [219, 219, 219] as const,
  zebra: [248, 248, 248] as const,
  brand: [201, 127, 10] as const,
  brandSoft: [253, 246, 233] as const,
  white: [255, 255, 255] as const,
};

export type Pdf = import("jspdf").jsPDF;

export const setFill = (pdf: Pdf, color: readonly number[]) =>
  pdf.setFillColor(color[0], color[1], color[2]);

export const setText = (pdf: Pdf, color: readonly number[]) =>
  pdf.setTextColor(color[0], color[1], color[2]);

export const setDraw = (pdf: Pdf, color: readonly number[]) =>
  pdf.setDrawColor(color[0], color[1], color[2]);

/** Corta o texto com reticências para caber na largura disponível. */
export const truncate = (pdf: Pdf, text: string, maxWidth: number): string => {
  if (pdf.getTextWidth(text) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && pdf.getTextWidth(`${out}…`) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
};

/**
 * Quebra o texto em até `maxLines` linhas que caibam na largura, cortando entre
 * PALAVRAS. O que não couber na última linha vira reticências.
 *
 * Existe para nome de produto em tabela: cortar um nome longo na primeira linha
 * esconde justamente o fim, que é onde costuma estar a medida que diferencia
 * duas peças ("...CAIXA SIFONADA 150" x "...CAIXA SIFONADA 200").
 *
 * Mede na fonte CORRENTE — chame depois de `setFont`/`setFontSize`, senão a
 * conta sai na fonte errada e a linha estoura a coluna.
 */
export const wrapLines = (
  pdf: Pdf,
  text: string,
  maxWidth: number,
  maxLines = 2
): string[] => {
  const lines = pdf.splitTextToSize(text, maxWidth) as string[];
  if (lines.length <= maxLines) return lines;
  // A sobra volta para a última linha permitida antes de virar reticências: o
  // começo da palavra cortada ainda ajuda a reconhecer o produto.
  const kept = lines.slice(0, maxLines - 1);
  const rest = lines.slice(maxLines - 1).join(" ");
  return [...kept, truncate(pdf, rest, maxWidth)];
};

export interface LogoBox {
  width: number;
  height: number;
}

/**
 * Encaixa a logo numa caixa preservando a proporção — logos chegam em
 * qualquer formato (quadrada, faixa larga) e esticar deformaria a marca.
 * Nunca amplia acima do tamanho natural, para não borrar imagem pequena.
 */
export const fitLogo = (
  image: Pick<LoadedImage, "width" | "height">,
  maxWidth: number,
  maxHeight: number
): LogoBox => {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  return { width: image.width * scale, height: image.height * scale };
};

type LogoInput = Pick<LoadedImage, "width" | "height"> | null;

/**
 * Ajusta duas logos à MESMA ALTURA, cada uma respeitando sua proporção.
 *
 * Encaixar cada uma na caixa isoladamente dava tamanhos visualmente
 * desiguais: uma logo em faixa esbarra na largura e fica baixinha, enquanto
 * uma quadrada usa a altura toda. Lado a lado no cabeçalho, parecia descuido.
 * Aqui a altura comum é a maior que as duas alcançam sem estourar a caixa nem
 * ampliar além do tamanho natural.
 */
export const fitLogoPair = (
  first: LogoInput,
  second: LogoInput,
  maxWidth: number,
  maxHeight: number
): [LogoBox | null, LogoBox | null] => {
  const heights = [first, second]
    .filter((image): image is Pick<LoadedImage, "width" | "height"> => !!image)
    .map((image) => fitLogo(image, maxWidth, maxHeight).height);

  // Sozinha, a logo usa a caixa inteira; em par, vale a menor das duas alturas.
  const shared = heights.length ? Math.min(...heights) : 0;

  const box = (image: LogoInput): LogoBox | null =>
    image
      ? { width: (image.width / image.height) * shared, height: shared }
      : null;

  return [box(first), box(second)];
};
