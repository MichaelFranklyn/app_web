import { cn } from "@/lib/utils";
import NextLink from "next/link";
import React from "react";

/**
 * - `accent`: o link que se oferece (âmbar) — "ver pedido", "Conhecer o Itinus".
 * - `inherit`: a cor do texto em volta — o link dentro da frase de um aviso.
 * - `muted`: o atalho secundário, cinza, que clareia no hover.
 */
export type TextLinkTone = "accent" | "inherit" | "muted";

/**
 * - `hover`: sublinha só ao passar o mouse (link que já se lê como link pela cor).
 * - `always`: sublinhado sempre — o link no meio da frase, da mesma cor dela.
 * - `none`: sem traço. Com `tone="inherit"` o hover pinta de âmbar (nome de
 *   cliente numa tabela); com `muted` vale o clarear do próprio tom.
 */
export type TextLinkUnderline = "hover" | "always" | "none";

const TONE: Record<TextLinkTone, string> = {
  accent: "text-(--amber)",
  inherit: "",
  muted: "text-(--muted) hover:text-(--text2)",
};

const UNDERLINE: Record<TextLinkUnderline, string> = {
  hover: "hover:underline",
  always: "underline hover:opacity-70",
  none: "",
};

interface TextLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href: string;
  tone?: TextLinkTone;
  underline?: TextLinkUnderline;
  /** Peso médio — o link que precisa se destacar dentro de um aviso. */
  emphasis?: boolean;
  /** Abre em outra aba: `target="_blank"` com `rel="noreferrer"`. */
  external?: boolean;
}

const isAppRoute = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

/**
 * Link de TEXTO — navegação dentro de uma frase, de uma célula ou de um
 * rodapé. O link com cara de botão é o `Button.Link`.
 *
 * Endereço que não é rota do app (`mailto:`, `tel:`, `https:`) sai como `<a>`
 * comum: o `next/link` tentaria pré-carregar e interceptar o clique. Um `Title`
 * dentro dele usa `color="inherit"` para pegar a cor do link.
 */
export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  (
    {
      href,
      tone = "accent",
      underline = "hover",
      emphasis = false,
      external = false,
      className,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "underline-offset-2 transition-colors",
      TONE[tone],
      UNDERLINE[underline],
      underline === "none" && tone === "inherit" && "hover:text-(--amber)",
      emphasis && "font-(--weight-medium)",
      className
    );
    const target = external
      ? { target: "_blank", rel: "noreferrer" }
      : undefined;

    if (!isAppRoute(href)) {
      return (
        <a ref={ref} href={href} className={classes} {...target} {...props} />
      );
    }
    return (
      <NextLink
        ref={ref}
        href={href}
        className={classes}
        {...target}
        {...props}
      />
    );
  }
);
TextLink.displayName = "TextLink";
