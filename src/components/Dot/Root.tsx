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
  /**
   * Força da cor. `soft` (padrão) é o ponto de status ao lado de texto;
   * `solid` marca o item que pede o olho (motivo do score, não lida);
   * `faint` é o "ainda não" (regra de senha não cumprida).
   */
  intensity?: DotIntensity;
}

export type DotIntensity = "soft" | "solid" | "faint";

// A força é uma MISTURA da cor com o fundo (`color-mix`), não `opacity`: o
// `animate-pulse-soft` anima a opacity e, com as duas no mesmo elemento, a
// intensidade sumia no meio do pulso.
const intensityClasses: Record<DotIntensity, string> = {
  soft: "bg-[color-mix(in_srgb,var(--dot)_60%,transparent)]",
  solid: "bg-(--dot)",
  faint: "bg-[color-mix(in_srgb,var(--dot)_40%,transparent)]",
};

const colorClasses: Record<ThemeColor, string> = {
  amber: "[--dot:var(--amber)]",
  red: "[--dot:var(--color-status-danger)]",
  green: "[--dot:var(--color-status-success)]",
  blue: "[--dot:var(--color-status-info)]",
  cyan: "[--dot:var(--cyan)]",
  purple: "[--dot:var(--purple)]",
  orange: "[--dot:var(--orange)]",
  pink: "[--dot:var(--pink)]",
  neutral: "[--dot:var(--color-text-muted)]",
  subtle: "[--dot:var(--dim)]",
  warning: "[--dot:var(--color-status-warning)]",
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
      intensity = "soft",
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
          colorClasses[color],
          shape === "bar"
            ? "h-[18px] w-[10px] rounded-[2px] bg-(--dot)"
            : cn(
                "rounded-full",
                intensityClasses[intensity],
                sizeClasses[size]
              ),
          pulse && "animate-pulse-soft",
          className
        )}
        {...props}
      />
    );
  }
);

DotRoot.displayName = "Dot.Root";
