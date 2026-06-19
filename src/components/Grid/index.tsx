import { GridItem } from "./Item";
import { GridRoot } from "./Root";

export const Grid = Object.assign(GridRoot, {
  Root: GridRoot,
  Item: GridItem,
});

export type { GridBreakpointCols, GridColCount, GridGap, GridRootProps } from "./Root/interface";
export type { GridItemProps } from "./Item/interface";
