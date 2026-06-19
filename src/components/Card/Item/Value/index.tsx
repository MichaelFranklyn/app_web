import { Title } from "@/components/Title";
import React from "react";
import { CardItemValueProps } from "./interface";

export const ItemValue = React.forwardRef<HTMLSpanElement, CardItemValueProps>(
  ({ color, className, ...props }, ref) => (
    <Title
      ref={ref as React.Ref<HTMLElement>}
      variant="value"
      color={color ?? undefined}
      className={className}
      {...props}
    />
  )
);

ItemValue.displayName = "Card.Item.Value";
