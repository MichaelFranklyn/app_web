import { cn } from "@/lib/utils";
import React from "react";
import { CardAccentDescriptionProps } from "./interface";
import { accentDescriptionStyle } from "./style";

export const AccentDescription = React.forwardRef<HTMLDivElement, CardAccentDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(accentDescriptionStyle, className)} {...props} />
  )
);

AccentDescription.displayName = "Card.Accent.Description";
