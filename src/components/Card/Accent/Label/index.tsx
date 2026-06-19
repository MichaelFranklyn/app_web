import { cn } from "@/lib/utils";
import React from "react";
import { CardAccentLabelProps } from "./interface";
import { accentLabelStyle } from "./style";

export const AccentLabel = React.forwardRef<HTMLDivElement, CardAccentLabelProps>(
  ({ color, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(accentLabelStyle({ color }), className)}
      {...props}
    />
  )
);

AccentLabel.displayName = "Card.Accent.Label";
