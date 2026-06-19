import { cn } from "@/lib/utils";
import React from "react";
import { CardFooterProps } from "./interface";
import { footerBgStyle, footerStyle } from "./style";

export const Footer = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ bg = "bg3", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(footerStyle, footerBgStyle[bg], className)}
      {...props}
    />
  )
);

Footer.displayName = "Card.Footer";
