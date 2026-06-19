import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import React from "react";
import { CardHeaderDescriptionProps } from "./interface";

export const HeaderDescription = React.forwardRef<HTMLParagraphElement, CardHeaderDescriptionProps>(
  ({ className, ...props }, ref) => (
    <Title
      ref={ref as React.Ref<HTMLElement>}
      {...props}
      variant="body-sm"
      color="muted"
      className={cn("whitespace-break-spaces", className)}
    />
  )
);

HeaderDescription.displayName = "Card.Header.Description";
