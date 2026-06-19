import React from "react";
import { cn } from "@/lib/utils";
import { footerRootStyle } from "./style";

export const FooterRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(footerRootStyle, className)} {...props} />
));

FooterRoot.displayName = "Table.Footer";
