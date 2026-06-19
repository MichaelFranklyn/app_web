import React from "react";
import { GridBreakpointCols } from "../Root/interface";

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: GridBreakpointCols;
  start?: GridBreakpointCols;
}
