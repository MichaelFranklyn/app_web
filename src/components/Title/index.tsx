import { cn } from "@/lib/utils";
import React, { createElement } from "react";
import { TitleProps, TitleWeight } from "./interface";
import { colorClasses, variantConfig, weightClasses } from "./style";

/**
 * Texto puro (string/número, ou lista deles: `{n} de {total}`) — o que dá
 * para pôr num `title`.
 */
const plainText = (children: React.ReactNode): string | null => {
  const parts = React.Children.toArray(children);
  if (!parts.length) return null;
  if (!parts.every((c) => typeof c === "string" || typeof c === "number"))
    return null;
  return parts.join("").trim() || null;
};

export const Title = React.forwardRef<HTMLElement, TitleProps>(
  (
    { variant, color = "default", weight, as, className, children, ...props },
    ref
  ) => {
    const config = variantConfig[variant];
    const finalWeight: TitleWeight = weight ?? config.defaultWeight;
    // Texto cortado com "…" precisa mostrar o resto em algum lugar: com
    // `truncate`/`line-clamp`, o texto inteiro vai no `title` (a dica do
    // navegador). Quem passar `title` próprio manda.
    const clips = /(^|[\s:])(truncate|line-clamp-\d)/.test(className ?? "");
    const autoTitle = clips ? plainText(children) : null;

    return createElement(
      as ?? config.element,
      {
        ref,
        className: cn(
          config.className,
          colorClasses[color],
          weightClasses[finalWeight],
          "leading-relaxed",
          className
        ),
        ...(autoTitle ? { title: autoTitle } : null),
        ...props,
      },
      children
    );
  }
);

Title.displayName = "Title";

export type { TitleColor } from "./interface";
