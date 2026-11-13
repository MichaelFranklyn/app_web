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

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape = "sm", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse bg-(--bg3)", shapeClasses[shape], className)}
      {...props}
    />
  )
);

Skeleton.displayName = "Loading.Skeleton";
