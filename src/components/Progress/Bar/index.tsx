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
}

export const Bar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, color = "amber", fillColor, className, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "h-[6px] w-full overflow-hidden rounded-[6px] bg-(--bg3)",
          className
        )}
        {...props}
      >
        <div
          className="h-full rounded-[6px] transition-all duration-500 ease-out"
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
