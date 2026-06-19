import { cn } from "@/lib/utils";
import { GridBreakpointCols, GridColCount, GridGap } from "./interface";

const COLS: Record<GridColCount, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
  5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
  9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
};

const MOBILE_COLS: Record<GridColCount, string> = {
  1: "mobile:grid-cols-1", 2: "mobile:grid-cols-2", 3: "mobile:grid-cols-3", 4: "mobile:grid-cols-4",
  5: "mobile:grid-cols-5", 6: "mobile:grid-cols-6", 7: "mobile:grid-cols-7", 8: "mobile:grid-cols-8",
  9: "mobile:grid-cols-9", 10: "mobile:grid-cols-10", 11: "mobile:grid-cols-11", 12: "mobile:grid-cols-12",
};

const TABLET_COLS: Record<GridColCount, string> = {
  1: "tablet:grid-cols-1", 2: "tablet:grid-cols-2", 3: "tablet:grid-cols-3", 4: "tablet:grid-cols-4",
  5: "tablet:grid-cols-5", 6: "tablet:grid-cols-6", 7: "tablet:grid-cols-7", 8: "tablet:grid-cols-8",
  9: "tablet:grid-cols-9", 10: "tablet:grid-cols-10", 11: "tablet:grid-cols-11", 12: "tablet:grid-cols-12",
};

const DESKTOP_COLS: Record<GridColCount, string> = {
  1: "desktop:grid-cols-1", 2: "desktop:grid-cols-2", 3: "desktop:grid-cols-3", 4: "desktop:grid-cols-4",
  5: "desktop:grid-cols-5", 6: "desktop:grid-cols-6", 7: "desktop:grid-cols-7", 8: "desktop:grid-cols-8",
  9: "desktop:grid-cols-9", 10: "desktop:grid-cols-10", 11: "desktop:grid-cols-11", 12: "desktop:grid-cols-12",
};

const DESKTOP_XL_COLS: Record<GridColCount, string> = {
  1: "desktop-xl:grid-cols-1", 2: "desktop-xl:grid-cols-2", 3: "desktop-xl:grid-cols-3", 4: "desktop-xl:grid-cols-4",
  5: "desktop-xl:grid-cols-5", 6: "desktop-xl:grid-cols-6", 7: "desktop-xl:grid-cols-7", 8: "desktop-xl:grid-cols-8",
  9: "desktop-xl:grid-cols-9", 10: "desktop-xl:grid-cols-10", 11: "desktop-xl:grid-cols-11", 12: "desktop-xl:grid-cols-12",
};

const GAP: Record<GridGap, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4",
  5: "gap-5", 6: "gap-6", 8: "gap-8", 10: "gap-10", 12: "gap-12",
  16: "gap-16", 20: "gap-20", 24: "gap-24",
};

const ROW_GAP: Record<GridGap, string> = {
  0: "gap-y-0", 1: "gap-y-1", 2: "gap-y-2", 3: "gap-y-3", 4: "gap-y-4",
  5: "gap-y-5", 6: "gap-y-6", 8: "gap-y-8", 10: "gap-y-10", 12: "gap-y-12",
  16: "gap-y-16", 20: "gap-y-20", 24: "gap-y-24",
};

const COL_GAP: Record<GridGap, string> = {
  0: "gap-x-0", 1: "gap-x-1", 2: "gap-x-2", 3: "gap-x-3", 4: "gap-x-4",
  5: "gap-x-5", 6: "gap-x-6", 8: "gap-x-8", 10: "gap-x-10", 12: "gap-x-12",
  16: "gap-x-16", 20: "gap-x-20", 24: "gap-x-24",
};

export const getGridRootClasses = (
  cols: GridBreakpointCols | undefined,
  gap: GridGap | undefined,
  rowGap: GridGap | undefined,
  colGap: GridGap | undefined,
  className?: string
): string =>
  cn(
    "grid",
    cols?.base && COLS[cols.base],
    cols?.mobile && MOBILE_COLS[cols.mobile],
    cols?.tablet && TABLET_COLS[cols.tablet],
    cols?.desktop && DESKTOP_COLS[cols.desktop],
    cols?.["desktop-xl"] && DESKTOP_XL_COLS[cols["desktop-xl"]],
    gap !== undefined && GAP[gap],
    rowGap !== undefined && ROW_GAP[rowGap],
    colGap !== undefined && COL_GAP[colGap],
    className
  );
