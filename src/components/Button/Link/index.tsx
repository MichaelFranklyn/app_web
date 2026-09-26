"use client";

import { ThemeAppearance, ThemeColor } from "@/lib/theme";
import NextLink from "next/link";
import React from "react";
import { ButtonContext } from "../Root/context";
import { ButtonSize } from "../Root/interface";
import { getButtonClasses } from "../Root/style";

interface ButtonLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "color"
> {
  href: string;
  /** Abre em outra aba (Google Maps, WhatsApp): `<a target="_blank">`. */
  external?: boolean;
  appearance?: ThemeAppearance;
  color?: ThemeColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  isIconOnly?: boolean;
  noUppercase?: boolean;
  dashed?: boolean;
  /** Nome acessível + tooltip, como no `Button.Root`. */
  label?: string;
}

/**
 * Um link com a cara do botão — navegação, não ação. Aceita `Button.Icon` e
 * `Button.Title` dentro, como o `Button.Root`.
 *
 * Endereço que não é rota do app (`tel:`, `mailto:`, `https:`) sai como `<a>`
 * comum: o `next/link` tentaria pré-carregar e interceptar o clique.
 */
export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      href,
      external = false,
      appearance = "solid",
      color = "amber",
      size = "md",
      fullWidth = false,
      isIconOnly = false,
      noUppercase = false,
      dashed = false,
      label,
      title,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const classes = getButtonClasses({
      appearance,
      color,
      size,
      isIconOnly,
      fullWidth,
      active: false,
      noPadding: false,
      noUppercase,
      dashed,
      className,
    });
    const common = {
      ref,
      className: classes,
      title: title ?? label,
      "aria-label": ariaLabel ?? label,
      ...props,
    };
    const isAppRoute = href.startsWith("/") && !external;

    return (
      <ButtonContext.Provider value={{ size, isIconOnly, loading: false }}>
        {isAppRoute ? (
          <NextLink href={href} {...common} />
        ) : (
          <a
            href={href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            {...common}
          />
        )}
      </ButtonContext.Provider>
    );
  }
);

ButtonLink.displayName = "Button.Link";
