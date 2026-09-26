import { cn } from "@/lib/utils";
import React from "react";
import { PUBLIC_PAGE_CONTAINER } from "../style";

/** Abas da página, entre o cabeçalho e o corpo — fora do `<main>`. */
export const Nav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn(PUBLIC_PAGE_CONTAINER, "pt-[16px]", className)}
    {...props}
  />
));

Nav.displayName = "PublicPage.Nav";
