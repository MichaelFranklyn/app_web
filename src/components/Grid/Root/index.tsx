import React from "react";
import { GridRootProps } from "./interface";
import { getGridRootClasses } from "./style";

export const GridRoot = React.forwardRef<HTMLDivElement, GridRootProps>(
  ({ cols, gap, rowGap, colGap, className, ...props }, ref) => (
    <div
      ref={ref}
      className={getGridRootClasses(cols, gap, rowGap, colGap, className)}
      {...props}
    />
  )
);

GridRoot.displayName = "Grid.Root";
