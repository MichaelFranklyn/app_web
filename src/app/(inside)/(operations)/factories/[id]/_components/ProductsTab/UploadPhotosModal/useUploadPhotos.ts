"use client";

import { useMutation } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SelectOption } from "@/components/Input";
import { useToast } from "@/components/Toast";
import { useAllPages } from "@/hooks/useAllPages";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { fileToBase64 } from "@/utils/file";
import { matchFilesToTargets } from "@/utils/image/match";
import { resizeImage } from "@/utils/image/resize";

import {
  SET_PRODUCT_IMAGES_MUTATION,
  UPLOAD_PHOTOS_PRODUCTS_QUERY,
} from "./gql";
import {
  PhotoAssignment,
  PhotoProduct,
  SetProductImagesResponse,
  UploadPhotosProductsData,
} from "./interface";
import { assignedPhotos, chunk, summarize } from "./utils";

// Definido fora do componente: `useAllPages` usa o seletor na dep list.
const selectProducts = (data: UploadPhotosProductsData) =>
  data.upload_photos_products;

interface Params {
  open: boolean;
  companyFactoryId: string;
  onChanged: () => void;
  onClose: () => void;
}

/**
 * Envio em massa de fotos do catálogo.
 *
 * O caminho todo mora aqui porque as etapas dependem uma da outra: o arquivo é
 * casado com o produto pelo nome, reduzido no navegador e mandado em lotes. O
 * usuário só solta os arquivos e confere.
 */
export function useUploadPhotos({
  open,
  companyFactoryId,
  onChanged,
  onClose,
}: Params) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoAssignment[]>([]);
  const [sent, setSent] = useState(0);
  const [setProductImages] = useMutation<SetProductImagesResponse>(
    SET_PRODUCT_IMAGES_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const productsInput = useMemo(
    () =>
      open
        ? {
            first: 1000,
            after: null,
            filters: [
              {
                field: "company_factory_id",
                operator: "eq",
                value: companyFactoryId,
              },
            ],
          }
        : null,
    [open, companyFactoryId]
  );

  const { nodes: products, loading: productsLoading } = useAllPages<
    PhotoProduct,
    UploadPhotosProductsData
  >(UPLOAD_PHOTOS_PRODUCTS_QUERY, productsInput, selectProducts);

  const productOptions = useMemo<SelectOption[]>(
    () =>
      products.map((product) => ({
        value: product.id,
        label: `${product.sku} — ${product.name}`,
        searchText: product.name,
      })),
    [products]
  );

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  // Object URLs vivem fora do React: sem revogar, cada abertura do modal vaza
  // uma cópia da foto na memória da aba.
  const previewUrls = useRef<string[]>([]);
  const revokePreviews = useCallback(() => {
    previewUrls.current.forEach(URL.revokeObjectURL);
    previewUrls.current = [];
  }, []);
  useEffect(() => revokePreviews, [revokePreviews]);

  /** Recebe os arquivos soltos e já resolve cada um para um produto. */
  const addFiles = useCallback(
    (files: File[]) => {
      const images = files.filter((file) => file.type.startsWith("image/"));
      if (images.length === 0) return;

      const matches = matchFilesToTargets(images, products);
      const added = matches.map(({ file, target }) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.push(previewUrl);
        return { file, previewUrl, productId: target?.id ?? "" };
      });
      setPhotos((prev) => [...prev, ...added]);
    },
    [products]
  );

  const assignProduct = useCallback((index: number, productId: string) => {
    setPhotos((prev) =>
      prev.map((photo, i) => (i === index ? { ...photo, productId } : photo))
    );
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    revokePreviews();
    setPhotos([]);
    setSent(0);
  }, [revokePreviews]);

  const stats = useMemo(() => summarize(photos), [photos]);

  const handleSubmit = async () => {
    const ready = assignedPhotos(photos);
    if (ready.length === 0) return;

    await execute(
      async () => {
        let updated = 0;
        const errors: { fileName: string; message: string }[] = [];

        for (const batch of chunk(ready)) {
          // Reduzir aqui (e não ao soltar) mantém a tela responsiva com 50
          // arquivos e evita trabalho com o que o usuário acabar descartando.
          const images = await Promise.all(
            batch.map(async (photo) => {
              const small = await resizeImage(photo.file);
              return {
                productId: photo.productId,
                imageBase64: await fileToBase64(small),
                imageFileName: small.name,
              };
            })
          );

          const res = await setProductImages({
            variables: { input: { companyFactoryId, images } },
          });
          const data = res.data?.setProductImages;
          if (!data?.status || !data.data) {
            throw new Error(data?.message ?? "Erro ao enviar as fotos");
          }
          updated += data.data.updated;
          errors.push(...data.data.errors);
          setSent((prev) => prev + batch.length);
        }

        return { updated, errors };
      },
      {
        successMessage: "Fotos enviadas",
        onSuccess: ({ updated, errors }) => {
          onChanged();
          onClose();
          reset();
          if (errors.length > 0) {
            toast({
              variant: "error",
              title: `${errors.length} foto(s) não foram gravadas`,
              description: errors
                .slice(0, 3)
                .map((e) => `${e.fileName}: ${e.message}`)
                .join(" · "),
            });
            return;
          }
          toast({
            variant: "success",
            title: `${updated} foto(s) no catálogo`,
            description: "As miniaturas já aparecem na lista de produtos.",
          });
        },
        onError: () => setSent(0),
      }
    );
  };

  return {
    photos,
    stats,
    sent,
    productOptions,
    productById,
    productsLoading,
    hasProducts: products.length > 0,
    addFiles,
    assignProduct,
    removePhoto,
    reset,
    handleSubmit,
    isLoading,
  };
}
