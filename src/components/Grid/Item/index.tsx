import React from "react";
import { GridItemProps } from "./interface";
import { getGridItemClasses } from "./style";

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ span, start, className, ...props }, ref) => (
    <div
      ref={ref}
      className={getGridItemClasses(span, start, className)}
      {...props}
    />
  )
);

GridItem.displayName = "Grid.Item";
