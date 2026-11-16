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

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * O raio da peça que o esqueleto ocupa — um badge é `pill`, uma tag é `xs`,
   * um card é `lg`. Sem esta prop, cada tela escrevia `rounded-*` à mão.
   */
  shape?: SkeletonShape;
}

/**
 * QUANDO USAR: carregamento de CONTEÚDO cuja forma já se conhece (card, lista,
 * KPI, texto). Ocupa o lugar do que vai chegar, então a tela não pula.
 * Linha de tabela → `Table.Skeleton`. Ação em andamento (salvar, enviar,
 * gerar PDF) → `Loading.Spinner`. Regras: PATTERNS/ds-usage-rules.md.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape = "sm", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("skeleton-shimmer", shapeClasses[shape], className)}
      {...props}
    />
  )
);

Skeleton.displayName = "Loading.Skeleton";
