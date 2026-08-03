"use client";

import { AlertTriangle, Trash } from "lucide-react";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";

import { PhotoAssignment, PhotoProduct } from "./interface";

interface Props {
  photo: PhotoAssignment;
  productOptions: SelectOption[];
  /** Produto já escolhido, para avisar que a foto vai substituir a atual. */
  product?: PhotoProduct;
  /** Outro arquivo desta mesma leva aponta para o mesmo produto. */
  isDuplicated: boolean;
  onAssign: (productId: string) => void;
  onRemove: () => void;
}

/**
 * Uma foto na tela de conferência: pré-visualização, produto a que ela vai e os
 * avisos que mudam a decisão do usuário (não casou, vai substituir uma foto que
 * já existe, ou dois arquivos disputando o mesmo produto).
 */
export function PhotoReviewRow({
  photo,
  productOptions,
  product,
  isDuplicated,
  onAssign,
  onRemove,
}: Props) {
  const selected =
    productOptions.find((option) => option.value === photo.productId) ?? null;

  return (
    <div className="flex items-start gap-12 rounded-(--r-md) border border-(--border) bg-(--bg2) p-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.previewUrl}
        alt={photo.file.name}
        className="size-56 shrink-0 rounded-(--r-sm) border border-(--border) object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Title variant="caption" color="muted" className="truncate">
          {photo.file.name}
        </Title>

        <Input.Select
          placeholder="Escolha o produto desta foto"
          options={productOptions}
          value={selected}
          onChange={(option) =>
            onAssign(Array.isArray(option) ? "" : (option?.value ?? ""))
          }
        />

        {!photo.productId && (
          <Title variant="caption" color="amber">
            O nome do arquivo não bateu com nenhum código de produto. Escolha o
            produto acima ou remova esta foto.
          </Title>
        )}

        {isDuplicated && (
          <Title
            variant="caption"
            color="amber"
            className="inline-flex items-center gap-4"
          >
            <AlertTriangle size={13} />
            Outra foto desta leva também aponta para este produto — só a última
            fica.
          </Title>
        )}

        {product?.imageUrl && (
          <Title variant="caption" color="muted">
            Este produto já tem foto: a atual será substituída.
          </Title>
        )}
      </div>

      <Button.Root
        type="button"
        appearance="ghost"
        color="red"
        size="sm"
        isIconOnly
        noUppercase
        label="Remover esta foto"
        onClick={onRemove}
      >
        <Button.Icon icon={Trash} />
      </Button.Root>
    </div>
  );
}
