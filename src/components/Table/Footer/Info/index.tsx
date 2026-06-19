import React from "react";
import { Title } from "@/components/Title";

export const FooterInfo = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <Title
    ref={ref as React.Ref<HTMLElement>}
    {...props}
    variant="body-xs"
    color="muted"
    className={className}
  />
));

FooterInfo.displayName = "Table.Footer.Info";
