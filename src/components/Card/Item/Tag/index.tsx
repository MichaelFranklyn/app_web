import { cn } from "@/lib/utils";
import React from "react";
import { CardItemActionProps } from "./interface";
import { itemActionStyle } from "./style";

export const ItemAction = React.forwardRef<HTMLDivElement, CardItemActionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(itemActionStyle, className)} {...props} />
  )
);

ItemAction.displayName = "Card.Item.Action";
