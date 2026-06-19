import { cn } from "@/lib/utils";
import React from "react";
import { CardAccentTitleProps } from "./interface";
import { accentTitleStyle } from "./style";

export const AccentTitle = React.forwardRef<HTMLDivElement, CardAccentTitleProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(accentTitleStyle, className)} {...props} />
  )
);

AccentTitle.displayName = "Card.Accent.Title";
