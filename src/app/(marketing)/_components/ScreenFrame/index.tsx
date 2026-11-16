import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Moldura dos prints do produto na landing (14/11/2026).
 *
 * `browser` é a tela do gestor no computador (1440×900, gravada em DPR 2);
 * `phone` é a do vendedor no celular (412×915). As medidas declaradas são as
 * de captura — trocar um print exige manter a mesma proporção, senão o Next
 * avisa que a altura não bate.
 *
 * Os prints saem da conta demo com a marca trocada ("Representação Demo") e
 * o seletor de papel do ambiente de desenvolvimento escondido — o roteiro de
 * captura está na memória `project_marketing_landing_route_group`.
 */
const SIZE = {
  browser: { width: 1440, height: 900 },
  phone: { width: 412, height: 915 },
} as const;

export function ScreenFrame({
  src,
  alt,
  device = "browser",
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  device?: keyof typeof SIZE;
  /** Largura que o print ocupa na página — é o que escolhe o arquivo servido. */
  sizes: string;
  /** Só o print da primeira dobra: os demais carregam conforme a rolagem. */
  priority?: boolean;
  className?: string;
}) {
  const image = (
    <Image
      src={src}
      alt={alt}
      {...SIZE[device]}
      sizes={sizes}
      priority={priority}
      className="block h-auto w-full"
    />
  );

  if (device === "phone") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-[28px] border-[6px] border-(--color-text) bg-(--bg2) shadow-(--shadow-lg)",
          className
        )}
      >
        {image}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-(--radius-lg) border border-(--border) bg-(--bg2) shadow-(--shadow-lg)",
        className
      )}
    >
      {/* A barra com os três pontos é o que diz "isto é a tela do sistema" —
          sem ela o print se confunde com um bloco da própria landing. */}
      <div
        aria-hidden
        className="flex items-center gap-6 border-b border-(--border) bg-(--bg3) px-12 py-8"
      >
        <span className="size-8 rounded-(--radius-full) bg-(--border2)" />
        <span className="size-8 rounded-(--radius-full) bg-(--border2)" />
        <span className="size-8 rounded-(--radius-full) bg-(--border2)" />
      </div>
      {image}
    </div>
  );
}
