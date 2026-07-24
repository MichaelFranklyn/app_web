import { decodeImage } from "@/utils/imageDecode";

/** Lado do PNG gerado a partir de um SVG (cabe no cabeçalho do PDF com folga). */
const RASTER_SIZE = 512;

/**
 * Converte um SVG escolhido pelo usuário em PNG, no próprio navegador.
 *
 * Logo de empresa quase sempre vem em SVG, mas o backend não aceita: um SVG
 * servido pela origem da API executa script se aberto direto. Rasterizar aqui
 * dá o melhor dos dois — o usuário escolhe o arquivo que ele tem, e o que
 * trafega e fica armazenado é uma imagem inerte.
 *
 * Arquivos que não são SVG passam intactos. Se a conversão falhar (SVG com
 * referência externa, canvas indisponível), devolve `null` para o chamador
 * avisar em vez de enviar algo que o backend rejeitaria.
 */
export const svgToPng = async (file: File): Promise<File | null> => {
  if (file.type !== "image/svg+xml") return file;

  // Tudo dentro do try, inclusive o createObjectURL: em contexto sem suporte
  // (ou com o objeto indisponível) o componente precisa avisar, não quebrar.
  let source = "";
  try {
    source = URL.createObjectURL(file);
    const image = await decodeImage(source);

    // SVG sem dimensões intrínsecas reporta 0: cai no quadrado padrão.
    const width = image.naturalWidth || RASTER_SIZE;
    const height = image.naturalHeight || RASTER_SIZE;
    const scale = Math.min(RASTER_SIZE / width, RASTER_SIZE / height, 4);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return null;

    return new File([blob], file.name.replace(/\.svg$/i, ".png"), {
      type: "image/png",
    });
  } catch {
    return null;
  } finally {
    if (source) URL.revokeObjectURL(source);
  }
};
