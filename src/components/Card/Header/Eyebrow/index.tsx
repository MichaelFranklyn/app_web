import { Title } from "@/components/Title";
import React from "react";
import { CardHeaderEyebrowProps } from "./interface";

export const HeaderEyebrow = React.forwardRef<HTMLParagraphElement, CardHeaderEyebrowProps>(
  ({ className, ...props }, ref) => (
    <Title
      ref={ref as React.Ref<HTMLElement>}
      {...props}
      variant="eyebrow"
      color="muted"
      className={className}
    />
  )
);

HeaderEyebrow.displayName = "Card.Header.Eyebrow";
