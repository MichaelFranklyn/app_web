import { cn } from "@/lib/utils";
import React from "react";
import { CardItemSubProps } from "./interface";
import { itemSubStyle } from "./style";

export const ItemSub = React.forwardRef<HTMLDivElement, CardItemSubProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(itemSubStyle, className)} {...props} />
  )
);

ItemSub.displayName = "Card.Item.Info.Sub";
