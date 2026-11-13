import { cn } from "@/lib/utils";
import NextLink from "next/link";
import React from "react";

const SPACING = {
  sm: "gap-8 [&>li]:pb-8",
  md: "gap-16 [&>li]:pb-16",
} as const;

interface RowListRootProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Respiro entre as linhas (o mesmo em cima e embaixo do traço). */
  spacing?: keyof typeof SPACING;
}

/**
 * Lista de linhas separadas por um traço, sem moldura — dentro de um card que
 * já dá a borda. O traço some na última linha.
 */
const Root = ({ spacing = "sm", className, ...props }: RowListRootProps) => (
  <ul className={cn("flex flex-col", SPACING[spacing], className)} {...props} />
);

interface RowListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /**
   * Linha inteira clicável: o conteúdo vai dentro de um link que ocupa a
   * linha e esmaece no hover. Sem `href`, a linha é só leitura.
   */
  href?: string;
}

const Item = ({ href, className, children, ...props }: RowListItemProps) => (
  <li
    className={cn(
      "border-b border-(--border) last:border-0 last:pb-0",
      className
    )}
    {...props}
  >
    {href ? (
      <NextLink
        href={href}
        className="block transition-opacity hover:opacity-70"
      >
        {children}
      </NextLink>
    ) : (
      children
    )}
  </li>
);

export const RowList = { Root, Item };
