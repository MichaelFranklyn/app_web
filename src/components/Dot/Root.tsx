import React from "react";
import { cn } from "@/lib/utils";
import { ThemeColor } from "@/lib/theme";

export type DotSize = "xs" | "sm" | "md" | "lg";

export interface DotProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: ThemeColor;
  size?: DotSize;
  pulse?: boolean;
  /**
   * `bar`: traço vertical, cheio, para uma faixa de ocorrências lado a lado
   * (uma execução por traço) — o padrão se lê na faixa inteira de uma vez.
   */
  shape?: "circle" | "bar";
}

const colorClasses: Record<ThemeColor, string> = {
  amber: "bg-(--amber)",
  red: "bg-(--red)",
  green: "bg-(--green)",
  blue: "bg-(--blue)",
  cyan: "bg-(--cyan)",
  purple: "bg-(--purple)",
  orange: "bg-(--orange)",
  pink: "bg-(--pink)",
  neutral: "bg-(--muted)",
  subtle: "bg-(--dim)",
};

const sizeClasses: Record<DotSize, string> = {
  // Em px explícito: a escala de spacing do projeto é em pixels (`h-2` = 2px),
  // e as classes herdadas do Tailwind padrão saíam com 1-2px — um ponto
  // invisível.
  xs: "size-[4px]",
  sm: "size-[6px]",
  md: "size-[8px]",
  lg: "size-[10px]",
};

export const DotRoot = React.forwardRef<HTMLDivElement, DotProps>(
  (
    {
      color = "amber",
      size = "sm",
      pulse = true,
      shape = "circle",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "shrink-0",
          shape === "bar"
            ? "h-[18px] w-[10px] rounded-[2px]"
            : cn("rounded-full opacity-60", sizeClasses[size]),
          colorClasses[color],
          pulse && "animate-pulse-soft",
          className
        )}
        {...props}
      />
    );
  }
);

DotRoot.displayName = "Dot.Root";
