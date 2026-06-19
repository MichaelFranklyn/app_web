import React from "react";

export type GridColCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

export interface GridBreakpointCols {
  base?: GridColCount;
  mobile?: GridColCount;
  tablet?: GridColCount;
  desktop?: GridColCount;
  "desktop-xl"?: GridColCount;
}

export interface GridRootProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: GridBreakpointCols;
  gap?: GridGap;
  rowGap?: GridGap;
  colGap?: GridGap;
}
