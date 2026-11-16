"use client";

import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import React from "react";

const spinnerVariants = cva("animate-spin shrink-0", {
  variants: {
    // A escala de spacing deste projeto é em PIXELS: `w-3` vale 3px, não 12px.
    // O spinner copiado do Tailwind padrão saía com 3, 5 e 8px — um ponto
    // girando que ninguém via. Tamanhos explícitos: 12, 20 e 32px.
    size: {
      sm: "w-12 h-12",
      md: "w-20 h-20",
      lg: "w-32 h-32",
    },
    colorClass: {
      default: "text-(--color-text-muted)",
      amber: "text-(--color-action-text)",
      blue: "text-(--color-status-info)",
      red: "text-(--color-status-danger)",
      green: "text-(--color-status-success)",
    },
  },
  defaultVariants: {
    size: "md",
    colorClass: "default",
  },
});

interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  colorClass?: "default" | "amber" | "blue" | "red" | "green";
}

/**
 * QUANDO USAR: AÇÃO em andamento que o usuário disparou (botão salvando,
 * PDF gerando, arquivo subindo) ou espera sem forma previsível. Nunca para
 * carregar o conteúdo de uma tela — isso é `Loading.Skeleton`, que não pula.
 * Regras: PATTERNS/ds-usage-rules.md.
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, colorClass, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        <Loader2
          className={cn(spinnerVariants({ size, colorClass }), className)}
        />
      </div>
    );
  }
);

Spinner.displayName = "Loading.Spinner";
