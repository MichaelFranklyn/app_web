import { getThemeClasses, ThemeColor } from "@/lib/theme";
import { cn } from "@/lib/utils";
import React from "react";

export type IconTileSize = "xs" | "sm" | "md" | "lg";

const SIZE: Record<IconTileSize, string> = {
  xs: "size-[22px] text-[13px] [&>svg]:size-[12px]",
  sm: "size-[32px] text-[13px] [&>svg]:size-[16px]",
  md: "size-[36px] text-[14px] [&>svg]:size-[18px]",
  lg: "size-[40px] text-[16px] [&>svg]:size-[20px]",
};

interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ThemeColor;
  /** `solid` para o número da parada; `tinted` para o ícone que ilustra. */
  appearance?: "tinted" | "solid";
  size?: IconTileSize;
  shape?: "circle" | "square";
  children: React.ReactNode;
}

/**
 * Ícone (ou número curto) dentro de uma forma colorida: o ícone ao lado do
 * título de uma opção, o número da parada na rota, a marca de uma vantagem.
 */
export const IconTile = React.forwardRef<HTMLSpanElement, IconTileProps>(
  (
    {
      color = "neutral",
      appearance = "tinted",
      size = "md",
      shape = "circle",
      className,
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(
        "font-head inline-flex shrink-0 items-center justify-center border-0 leading-none font-bold",
        getThemeClasses(appearance, color),
        SIZE[size],
        shape === "circle" ? "rounded-full" : "rounded-(--r-sm)",
        className
      )}
      {...props}
    />
  )
);

IconTile.displayName = "IconTile";
