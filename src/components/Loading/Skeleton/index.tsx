import { cn } from "@/lib/utils";
import React from "react";

export type SkeletonShape = "xs" | "sm" | "md" | "lg" | "pill";

const shapeClasses: Record<SkeletonShape, string> = {
  xs: "rounded-(--r-xs)",
  sm: "rounded-(--r-sm)",
  md: "rounded-(--r-md)",
  lg: "rounded-(--r-lg)",
  /** Avatar, badge, barra: as pontas redondas. */
  pill: "rounded-full",
};

/**
 * A linha de texto que o esqueleto ocupa, pelo nome da variante do `Title`.
 * A barra tem a altura da LETRA e a margem completa a altura da LINHA
 * (o `Title` usa `leading-relaxed`, 1.625): o bloco ocupa o mesmo espaço do
 * texto que chega, sem pulo — antes cada tela chutava `h-[12px]`, `h-[11px]`,
 * `h-[10px]` para o mesmo corpo de 13px.
 */
export type SkeletonText =
  | "body-sm"
  | "body"
  | "body-md"
  | "heading-sm"
  | "heading-md"
  | "heading-lg"
  | "kpi";

const textClasses: Record<SkeletonText, string> = {
  /** 13px — body-sm, body-xs, micro, label, eyebrow (linha de 21px). */
  "body-sm": "h-[13px] my-[4px]",
  /** 14px — body, caption, value (linha de 23px). */
  body: "h-[14px] my-[4.5px]",
  /** 15px (linha de 24px). */
  "body-md": "h-[15px] my-[4.5px]",
  /** 16px (linha de 26px). */
  "heading-sm": "h-[16px] my-[5px]",
  /** 19px (linha de 31px). */
  "heading-md": "h-[19px] my-[6px]",
  /** 25px (linha de 41px). */
  "heading-lg": "h-[25px] my-[8px]",
  /** 31px (linha de 50px). */
  kpi: "h-[31px] my-[9.5px]",
};

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * O raio da peça que o esqueleto ocupa — um badge é `pill`, uma tag é `xs`,
   * um card é `lg`. Sem esta prop, cada tela escrevia `rounded-*` à mão.
   */
  shape?: SkeletonShape;
  /**
   * Esqueleto de uma linha de texto: altura e respiro vêm da tipografia
   * (ver `SkeletonText`). A largura continua no `className`.
   */
  text?: SkeletonText;
}

/**
 * QUANDO USAR: carregamento de CONTEÚDO cuja forma já se conhece (card, lista,
 * KPI, texto). Ocupa o lugar do que vai chegar, então a tela não pula.
 * Linha de tabela → `Table.Skeleton`. Ação em andamento (salvar, enviar,
 * gerar PDF) → `Loading.Spinner`. Regras: PATTERNS/ds-usage-rules.md.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape = "sm", text, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "skeleton-shimmer",
        shapeClasses[shape],
        text && textClasses[text],
        className
      )}
      {...props}
    />
  )
);

Skeleton.displayName = "Loading.Skeleton";
