"use client";

import { useMemo } from "react";

import { SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";

import { PhotoAssignment, PhotoProduct } from "./interface";
import { PhotoReviewRow } from "./PhotoReviewRow";
import { duplicatedProductIds } from "./utils";

interface Props {
  photos: PhotoAssignment[];
  productOptions: SelectOption[];
  productById: Map<string, PhotoProduct>;
  onAssign: (index: number, productId: string) => void;
  onRemove: (index: number) => void;
}

/**
 * Conferência das fotos antes de gravar.
 *
 * As que não casaram sobem para o topo: são as únicas que exigem decisão, e
 * enterradas no meio de cinquenta linhas passariam despercebidas.
 */
export function PhotoReviewList({
  photos,
  productOptions,
  productById,
  onAssign,
  onRemove,
}: Props) {
  const duplicated = useMemo(() => duplicatedProductIds(photos), [photos]);

  // Guarda o índice original: é por ele que atribuir e remover funcionam.
  const ordered = useMemo(
    () =>
      photos
        .map((photo, index) => ({ photo, index }))
        .sort(
          (a, b) => Number(!!a.photo.productId) - Number(!!b.photo.productId)
        ),
    [photos]
  );

  if (photos.length === 0) {
    return (
      <Title variant="body-sm" color="muted">
        Nenhuma foto escolhida ainda. As fotos devem ser nomeadas com o código
        do produto (ex.: &quot;CP-M-001.jpg&quot;) para o sistema reconhecê-las
        sozinho — mas você também pode escolher o produto de cada uma à mão.
      </Title>
    );
  }

  return (
    <div className="flex max-h-96 flex-col gap-8 overflow-y-auto">
      {ordered.map(({ photo, index }) => (
        <PhotoReviewRow
          key={photo.previewUrl}
          photo={photo}
          productOptions={productOptions}
          product={productById.get(photo.productId)}
          isDuplicated={duplicated.has(photo.productId)}
          onAssign={(productId) => onAssign(index, productId)}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
}
