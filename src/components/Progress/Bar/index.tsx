import { cn } from "@/lib/utils";
import React from "react";
import { ProgressColor } from "../Root/interface";
import { PROGRESS_COLOR_TOKENS } from "../Root/style";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
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

export const Bar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    { value, color = "amber", fillColor, shape = "pill", className, ...props },
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
        className={cn(
          "h-[6px] w-full overflow-hidden bg-(--bg3)",
          shape === "square" ? "rounded-[2px]" : "rounded-[6px]",
          className
        )}
        {...props}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
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
