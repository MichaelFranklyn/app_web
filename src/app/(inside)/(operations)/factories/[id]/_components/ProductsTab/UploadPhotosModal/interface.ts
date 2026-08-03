import { Connection } from "@/hooks/useAllPages";

export interface PhotoProduct {
  id: string;
  sku: string;
  name: string;
  imageUrl: string | null;
}

export interface UploadPhotosProductsData {
  upload_photos_products: Connection<PhotoProduct>;
}

/**
 * Uma foto solta na tela, já resolvida (ou não) para um produto.
 *
 * `productId` começa com o resultado do casamento automático pelo nome do
 * arquivo e pode ser trocado à mão na tela de conferência — inclusive para
 * vazio, que é como o usuário descarta uma foto sem removê-la da lista.
 */
export interface PhotoAssignment {
  file: File;
  /** URL local (object URL) para a pré-visualização; revogada ao fechar. */
  previewUrl: string;
  productId: string;
}

export interface SetProductImagesResponse {
  setProductImages: {
    status: boolean;
    message: string;
    data: {
      total: number;
      updated: number;
      failed: number;
      errors: { fileName: string; message: string }[];
    } | null;
  };
}
