import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/Card";

const FooterRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card.Footer ref={ref} className={cn(className)} {...props} />
));

const FooterInfo = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-[12px] text-(--muted)", className)}
    {...props}
  />
));

const FooterActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex shrink-0 items-center gap-[6px]", className)}
    {...props}
  />
));

FooterRoot.displayName = "ImportLogCard.Footer";
FooterInfo.displayName = "ImportLogCard.Footer.Info";
FooterActions.displayName = "ImportLogCard.Footer.Actions";

export const Footer = Object.assign(FooterRoot, {
  Info: FooterInfo,
  Actions: FooterActions,
});
