"use client";

import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { mediaUrl } from "@/utils/media";

interface Props {
  imageUrl: string | null;
  /** Nome do produto — vira o texto alternativo da imagem. */
  name: string;
  size?: "xs" | "sm" | "lg";
}

const BOX = {
  /**
   * Cabe na linha de uma opção de select sem esticá-la. 24px é um valor da
   * escala de spacing do tema (`--spacing-24`) — número fora dela cai no
   * `--spacing` padrão do Tailwind (0.25rem), e era o que fazia a miniatura
   * do select sair com 112px.
   */
  xs: "size-24",
  sm: "size-40",
  lg: "aspect-square w-full",
} as const;

const ICON = { xs: 12, sm: 16, lg: 28 } as const;

/**
 * Miniatura do produto, com o mesmo enquadramento em qualquer lugar que ela
 * apareça (lista, galeria, escolha de item do pedido).
 *
 * Produto sem foto mostra um espaço reservado em vez de sumir: a lista fica
 * alinhada e o vazio comunica "falta a foto deste", que é justamente o que o
 * gestor procura ao conferir o catálogo.
 */
export function ProductThumb({ imageUrl, name, size = "sm" }: Props) {
  const src = mediaUrl(imageUrl);

  if (!src) {
    return (
      <div
        className={cn(
          BOX[size],
          "flex shrink-0 items-center justify-center rounded-(--r-sm) border border-dashed border-(--border) bg-(--bg2) text-(--muted)"
        )}
        aria-label={`${name} — sem foto`}
      >
        <ImageOff size={ICON[size]} />
      </div>
    );
  }

  return (
    // <img> nativa de propósito: a origem é a API (que em produção redireciona
    // para o Supabase), e o otimizador do next/image exigiria liberar os dois
    // hosts em `images.remotePatterns` para ganhar nada num quadro de 40px.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading="lazy"
      className={cn(
        BOX[size],
        "shrink-0 rounded-(--r-sm) border border-(--border) bg-(--bg2) object-cover"
      )}
    />
  );
}
