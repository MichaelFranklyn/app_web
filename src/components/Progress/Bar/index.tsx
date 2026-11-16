import { cn } from "@/lib/utils";
import React from "react";
import { ProgressColor } from "../Root/interface";
import { PROGRESS_COLOR_TOKENS } from "../Root/style";

interface ProgressBarBaseProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby"
> {
  value: number;
  color?: ProgressColor;
  /**
   * Cor livre do preenchimento, por cima de `color` — para barras que repetem
   * a cor de uma série de gráfico (`CHART_PALETTE`), fora dos tons do DS.
   */
  fillColor?: string;
  /**
   * `pill` (padrão): cantos de 6px. `square`: cantos de 2px — numa barra que
   * compara fatias, a cápsula come as pontas e a fatia pequena vira um grão
   * afilado que não dá para comparar com as outras.
   */
  shape?: "pill" | "square";
}

/**
 * Nome acessível OBRIGATÓRIO (WCAG 4.1.2): um `role="progressbar"` sem nome é
 * lido como "barra de progresso, 40%" — de quê? No /dashboard as quatro barras
 * de metas soavam iguais (auditoria 13/11/2026, P-14.2).
 *
 *   • `label` vira o `aria-label` (o caso comum: texto curto e próprio).
 *   • `aria-labelledby` aponta para um texto que já está na tela.
 */
export type ProgressBarProps = ProgressBarBaseProps &
  (
    | { label: string; "aria-labelledby"?: never }
    | { label?: never; "aria-labelledby": string }
  );

export const Bar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      color = "amber",
      fillColor,
      shape = "pill",
      label,
      className,
      ...props
    },
    ref
  ) => {
    const pct = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          "h-[6px] w-full overflow-hidden bg-(--bg3)",
          shape === "square" ? "rounded-[2px]" : "rounded-[6px]",
          className
        )}
        {...props}
      >
        <div
          className="h-full transition-[width] duration-500 ease-(--ease-out-soft)"
          style={{
            width: `${pct}%`,
            background: fillColor ?? PROGRESS_COLOR_TOKENS[color],
            borderRadius: "inherit",
          }}
        />
      </div>
    );
  }
);

Bar.displayName = "Progress.Bar";
