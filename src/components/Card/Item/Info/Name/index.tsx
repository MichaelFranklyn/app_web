import { cn } from "@/lib/utils";
import React from "react";
import { CardItemNameProps } from "./interface";
import { itemNameStyle } from "./style";

export const ItemName = React.forwardRef<HTMLDivElement, CardItemNameProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(itemNameStyle, className)} {...props} />
  )
);

ItemName.displayName = "Card.Item.Info.Name";
