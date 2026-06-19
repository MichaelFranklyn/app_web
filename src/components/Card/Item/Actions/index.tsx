import { cn } from "@/lib/utils";
import React from "react";
import { CardItemActionsProps } from "./interface";
import { itemActionsStyle } from "./style";

export const ItemActions = React.forwardRef<HTMLDivElement, CardItemActionsProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(itemActionsStyle, className)} {...props} />
  )
);

ItemActions.displayName = "Card.Item.Actions";
