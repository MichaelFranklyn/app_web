import { cn } from "@/lib/utils";
import React from "react";
import { CardAccentRootProps } from "./interface";
import { accentBorderStyle, accentRootStyle } from "./style";

export const AccentRoot = React.forwardRef<HTMLDivElement, CardAccentRootProps>(
  ({ color, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(accentRootStyle, accentBorderStyle[color], className)}
      {...props}
    />
  )
);

AccentRoot.displayName = "Card.Accent";
