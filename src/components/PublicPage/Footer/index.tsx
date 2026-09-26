import { cn } from "@/lib/utils";
import React from "react";
import { PUBLIC_PAGE_CONTAINER } from "../style";

export const Footer = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => (
  <footer ref={ref} className="border-t border-(--border)" {...props}>
    <div className={cn(PUBLIC_PAGE_CONTAINER, "py-[24px]", className)}>
      {children}
    </div>
  </footer>
));

Footer.displayName = "PublicPage.Footer";
