import { cn } from "@/lib/utils";
import React from "react";
import { CardBodyProps } from "./interface";
import { bodyStyle } from "./style";

export const Body = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ padding, columns, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(bodyStyle({ padding, columns }), className)}
      {...props}
    />
  )
);

Body.displayName = "Card.Body";
