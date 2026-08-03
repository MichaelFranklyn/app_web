import { decodeImage } from "@/utils/imageDecode";

/** Maior lado da imagem gravada. Suficiente para o card do catálogo e o zoom. */
export const MAX_IMAGE_SIDE = 1000;

/** Qualidade do JPEG gerado — acima disso o ganho visual não paga o peso. */
const JPEG_QUALITY = 0.8;

/**
 * Reduz uma foto no próprio navegador, antes de qualquer upload.
 *
 * Não é otimização opcional: a foto sai do celular com 3 a 5 MB, o envio é em
 * base64 (que cresce ~33%) e passa pelo BFF da Vercel, que tem limite de corpo.
 * Cinquenta fotos de catálogo estourariam esse limite; reduzidas, cada uma fica
 * na casa de 100 KB e o lote passa. De quebra, o teto de 2 MB por arquivo que o
 * backend impõe deixa de ser alcançável por foto de celular.
 *
 * Devolve o arquivo original quando ele não é imagem raster ou quando o canvas
 * falha: nesses casos quem valida é o backend, com mensagem própria.
 */
export const resizeImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/")) return file;

  let source = "";
  try {
    source = URL.createObjectURL(file);
    const image = await decodeImage(source);

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) return file;

    // Só encolhe: ampliar uma foto pequena não acrescenta detalhe e só pesa.
    const scale = Math.min(MAX_IMAGE_SIDE / width, MAX_IMAGE_SIDE / height, 1);
    if (scale === 1 && file.type === "image/jpeg") return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    // PNG com transparência viraria fundo preto no JPEG: pinta de branco antes.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    return new File([blob], toJpegName(file.name), { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    if (source) URL.revokeObjectURL(source);
  }
};

/**
 * Troca a extensão por .jpg preservando o resto do nome.
 *
 * O nome importa: é por ele que o envio em massa casa a foto com o produto
 * (o arquivo se chama como o SKU), e é ele que aparece na lista de erros.
 */
export const toJpegName = (name: string): string =>
  name.replace(/\.[^.]+$/, "") + ".jpg";
