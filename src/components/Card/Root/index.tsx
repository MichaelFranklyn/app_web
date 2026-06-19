import { cn } from "@/lib/utils";
import React from "react";
import { CardRootProps } from "./interface";
import { rootStyle } from "./style";

export const Root = React.forwardRef<HTMLDivElement, CardRootProps>(
  ({ accent, isCompact, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(rootStyle({ accent, isCompact }), className)}
      {...props}
    />
  )
);

Root.displayName = "Card.Root";
