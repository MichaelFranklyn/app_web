import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * - `full`: a marca inteira (símbolo + nome), horizontal — login, cadastro,
 *   menu lateral aberto.
 * - `mark`: só o símbolo, quadrado — menu lateral recolhido.
 */
type BrandLogoVariant = "full" | "mark";

const SOURCES: Record<
  BrandLogoVariant,
  { src: string; width: number; height: number }
> = {
  full: { src: "/horizontal_logo.png", width: 1023, height: 256 },
  // O símbolo puro já vem no precache do service worker.
  mark: { src: "/icon-192.png", width: 192, height: 192 },
};

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** Logo acima da dobra (tela de entrada): carrega antes do resto. */
  priority?: boolean;
  /** Dica de largura para o otimizador (`sizes` do next/image). */
  sizes?: string;
  /** Só largura e posição — a altura segue a proporção da arte. */
  className?: string;
}

/**
 * A logo do Itinus — arquivo ESTÁTICO do app, por isso passa pelo otimizador do
 * `next/image` e chega no tamanho em que é exibida. Logo que vem da API (da
 * empresa, da fábrica) é o `MediaImage`.
 */
export function BrandLogo({
  variant = "full",
  priority,
  sizes,
  className,
}: BrandLogoProps) {
  const { src, width, height } = SOURCES[variant];
  return (
    <Image
      src={src}
      alt="Itinus"
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={cn("h-auto", className)}
    />
  );
}
