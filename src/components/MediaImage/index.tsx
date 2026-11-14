"use client";

import { cn } from "@/lib/utils";
import { ImgHTMLAttributes, ReactNode, useState } from "react";

type MediaImageFit = "cover" | "contain" | "logo";

interface MediaImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "alt"
> {
  alt: string;
  /**
   * `cover` preenche a moldura; `contain` cabe inteira nela; `logo` é a logo
   * completa solta no conteúdo — altura fixa e largura que a proporção pedir.
   */
  fit?: MediaImageFit;
  /**
   * O que mostrar se a imagem não carregar (arquivo apagado, mídia fora do ar).
   * Sem ele fica o ícone de imagem quebrada do navegador.
   */
  fallback?: ReactNode;
}

const FITS: Record<MediaImageFit, string> = {
  cover: "h-full w-full object-cover",
  contain: "h-full w-full object-contain",
  logo: "h-[56px] max-w-full self-start object-contain",
};

/**
 * Imagem que vem da API (logo, foto): `<img>` nativa de propósito — next/image
 * exigiria remotePatterns e dimensões fixas, e a origem em produção redireciona.
 */
export const MediaImage = ({
  fit = "cover",
  className,
  alt,
  fallback,
  src,
  onError,
  ...rest
}: MediaImageProps) => {
  // Guarda QUAL endereço falhou: trocar a imagem zera o erro sem efeito.
  const [failedSrc, setFailedSrc] = useState<unknown>(null);

  if (fallback !== undefined && src && failedSrc === src)
    return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      decoding="async"
      alt={alt}
      src={src}
      {...rest}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
      className={cn(FITS[fit], className)}
    />
  );
};
