import { PhotoAssignment } from "./interface";

/**
 * Quantas fotos vão em cada chamada da mutation.
 *
 * O envio é base64 e passa pelo BFF da Vercel, que tem limite de corpo. Mesmo
 * depois da redução no navegador (~120 KB por foto), mandar 50 de uma vez
 * chegaria perto do teto; em lotes de 8 o corpo fica na casa de 1,5 MB e uma
 * falha de rede custa oito fotos, não o envio inteiro.
 */
export const UPLOAD_BATCH_SIZE = 8;

/** Fatia a lista em lotes do tamanho de envio. */
export function chunk<T>(items: T[], size = UPLOAD_BATCH_SIZE): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

/** Fotos que têm produto escolhido — as únicas que serão enviadas. */
export const assignedPhotos = (photos: PhotoAssignment[]): PhotoAssignment[] =>
  photos.filter((photo) => photo.productId);

/**
 * Produtos com mais de uma foto apontada para eles.
 *
 * Acontece quando o fornecedor manda "CP-001.jpg" e "CP-001.png": as duas casam
 * com o mesmo produto e a última gravada venceria em silêncio. A tela avisa e
 * deixa o usuário decidir qual descartar.
 */
export function duplicatedProductIds(photos: PhotoAssignment[]): Set<string> {
  const seen = new Set<string>();
  const duplicated = new Set<string>();
  for (const { productId } of assignedPhotos(photos)) {
    if (seen.has(productId)) duplicated.add(productId);
    seen.add(productId);
  }
  return duplicated;
}

/** Resumo para o cabeçalho da conferência. */
export function summarize(photos: PhotoAssignment[]) {
  const matched = assignedPhotos(photos).length;
  return {
    total: photos.length,
    matched,
    unmatched: photos.length - matched,
    duplicated: duplicatedProductIds(photos).size,
  };
}
