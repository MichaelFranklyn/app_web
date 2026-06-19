import { cn } from "@/lib/utils";
import React from "react";
import { CardItemInfoRootProps } from "./interface";
import { itemInfoStyle } from "./style";

export const ItemInfoRoot = React.forwardRef<HTMLDivElement, CardItemInfoRootProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(itemInfoStyle, className)} {...props} />
  )
);

ItemInfoRoot.displayName = "Card.Item.Info";
