"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { AvatarProps } from "./interface";
import { avatarStyles } from "./style";

/**
 * Foto ou iniciais num círculo. Se a imagem falhar (arquivo apagado, mídia
 * fora do ar), cai nas iniciais com a cor do tema — antes ficava o ícone de
 * imagem quebrada e o alt "Avatar", que não diz de quem é.
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = "md",
      color = "amber",
      src,
      alt,
      initials,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Guarda QUAL endereço falhou: trocar a foto zera o erro sem efeito.
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showImage = Boolean(src) && failedSrc !== src;
    const displayContent =
      initials ?? children ?? (alt ? alt.substring(0, 2).toUpperCase() : null);

    return (
      <div
        ref={ref}
        className={cn(
          avatarStyles.root,
          avatarStyles.sizes[size],
          !showImage && avatarStyles.colors[color],
          className
        )}
        {...props}
      >
        {showImage ? (
          // Avatar aceita URL arbitrária (uploads/externas); next/image exigiria
          // remotePatterns + dimensões fixas. <img> é intencional aqui.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            // Sem nome, a imagem é decorativa (o nome já está ao lado).
            alt={alt ?? ""}
            className={avatarStyles.image}
            onError={() => setFailedSrc(src ?? null)}
          />
        ) : (
          <span role={alt ? "img" : undefined} aria-label={alt}>
            {displayContent}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export type { AvatarProps } from "./interface";
