import { decodeImage } from "./imageDecode";
import { LoadedImage } from "./media";

/** Alfa a partir do qual o pixel conta como desenho (ignora anti-aliasing). */
const ALPHA_THRESHOLD = 8;

/**
 * Recorta a moldura transparente em volta do desenho.
 *
 * Logo costuma vir num quadro folgado: a da Padrão Forte tem 500x400px com o
 * desenho ocupando 412x134 — dois terços do arquivo são vazio. Ao encaixar
 * duas logos na mesma altura, a que tem mais margem aparece bem menor, e o
 * cabeçalho do PDF fica torto. Recortando, "mesma altura" passa a significar
 * mesma altura VISÍVEL.
 *
 * Devolve a imagem original quando não há o que recortar, quando o canvas não
 * está disponível (SSR, teste) ou em qualquer falha — o documento não pode
 * deixar de sair por causa disto.
 */
export const trimTransparent = async (
  image: LoadedImage | null
): Promise<LoadedImage | null> => {
  if (!image) return null;
  try {
    const element = await decodeImage(image.dataUrl);
    const width = element.naturalWidth;
    const height = element.naturalHeight;
    if (!width || !height) return image;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return image;
    context.drawImage(element, 0, 0);

    const { data } = context.getImageData(0, 0, width, height);
    let top = height;
    let bottom = -1;
    let left = width;
    let right = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }

    // Sem pixel opaco (logo toda transparente) ou já sem margem: nada a fazer.
    if (bottom < top || right < left) return image;
    const cropW = right - left + 1;
    const cropH = bottom - top + 1;
    if (cropW === width && cropH === height) return image;

    const cropped = document.createElement("canvas");
    cropped.width = cropW;
    cropped.height = cropH;
    const cropContext = cropped.getContext("2d");
    if (!cropContext) return image;
    cropContext.drawImage(element, left, top, cropW, cropH, 0, 0, cropW, cropH);

    return {
      dataUrl: cropped.toDataURL("image/png"),
      width: cropW,
      height: cropH,
    };
  } catch {
    return image;
  }
};
