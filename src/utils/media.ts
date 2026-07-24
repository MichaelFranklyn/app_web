import { decodeImage } from "./imageDecode";

/**
 * URL absoluta de um arquivo servido pela API (`/media/...`).
 *
 * O backend grava logos e arquivos-modelo e devolve sempre um caminho relativo
 * — quem serve (disco local em dev, Supabase Storage em produção) é detalhe
 * dele. Cabe ao front prefixar com a origem da API.
 */
export interface LoadedImage {
  /** Conteúdo em data URL, formato aceito pelo `addImage` do jsPDF. */
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Baixa uma imagem de qualquer URL (inclusive assets do próprio front, como a
 * marca do sistema em `/horizontal_logo.png`) e devolve data URL + dimensões,
 * para embutir em PDFs gerados no navegador.
 *
 * Devolve `null` em qualquer falha (rede, CORS, arquivo removido): a logo é
 * enfeite do documento — o PDF tem de sair mesmo sem ela.
 */
export const loadImageFromUrl = async (
  url?: string | null
): Promise<LoadedImage | null> => {
  if (!url) return null;
  try {
    // `cache: "no-store"` não é capricho: a mesma imagem costuma já ter sido
    // baixada por uma tag <img> (sidebar, avatar), e essa resposta fica no
    // cache SEM os cabeçalhos CORS — porque <img> não envia `Origin`. O fetch
    // reaproveitaria essa entrada e seria bloqueado, deixando o PDF sem a logo.
    const response = await fetch(url, { mode: "cors", cache: "no-store" });
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const element = await decodeImage(dataUrl);
    const size = {
      width: element.naturalWidth,
      height: element.naturalHeight,
    };
    if (!size.width || !size.height) return null;
    return { dataUrl, ...size };
  } catch {
    return null;
  }
};

/** Imagem servida pela API a partir do caminho relativo (`/media/...`). */
export const loadImage = async (
  path?: string | null
): Promise<LoadedImage | null> => loadImageFromUrl(mediaUrl(path));

export const mediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  try {
    const origin = new URL(process.env.NEXT_PUBLIC_GRAPHQL_API_HOST ?? "")
      .origin;
    return `${origin}${path}`;
  } catch {
    return undefined;
  }
};
