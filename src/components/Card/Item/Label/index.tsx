import { Title } from "@/components/Title";
import React from "react";
import { CardItemLabelProps } from "./interface";

export const ItemLabel = React.forwardRef<HTMLSpanElement, CardItemLabelProps>(
  ({ className, ...props }, ref) => (
    <Title
      ref={ref as React.Ref<HTMLElement>}
      {...props}
      variant="body"
      color="muted"
      className={className}
    />
  )
);

ItemLabel.displayName = "Card.Item.Label";
