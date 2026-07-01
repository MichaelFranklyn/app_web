import { cn } from "@/lib/utils";
import React from "react";
import { CardHeaderActionsProps } from "./interface";
import { headerActionsStyle } from "./style";

export const HeaderActions = React.forwardRef<
  HTMLDivElement,
  CardHeaderActionsProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(headerActionsStyle, className)} {...props} />
));

HeaderActions.displayName = "Card.Header.Actions";
