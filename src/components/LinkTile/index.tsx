import { cn } from "@/lib/utils";
import React from "react";

/**
 * Um atalho de várias linhas sem moldura (o índice de uma página longa, que
 * pula para a âncora): o realce aparece ao passar o mouse. Para navegar entre
 * rotas do app, `Button.Link`; este é para âncoras e textos que não cabem num
 * botão.
 */
export const LinkTile = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex gap-8 rounded-(--r-sm) p-8 transition-colors hover:bg-(--bg3) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)",
      className
    )}
    {...props}
  />
));

LinkTile.displayName = "LinkTile";
