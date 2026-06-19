import { cn } from "@/lib/utils";
import { GridBreakpointCols, GridColCount } from "../Root/interface";

const SPAN: Record<GridColCount, string> = {
  1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
  5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
  9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
};

const MOBILE_SPAN: Record<GridColCount, string> = {
  1: "mobile:col-span-1", 2: "mobile:col-span-2", 3: "mobile:col-span-3", 4: "mobile:col-span-4",
  5: "mobile:col-span-5", 6: "mobile:col-span-6", 7: "mobile:col-span-7", 8: "mobile:col-span-8",
  9: "mobile:col-span-9", 10: "mobile:col-span-10", 11: "mobile:col-span-11", 12: "mobile:col-span-12",
};

const TABLET_SPAN: Record<GridColCount, string> = {
  1: "tablet:col-span-1", 2: "tablet:col-span-2", 3: "tablet:col-span-3", 4: "tablet:col-span-4",
  5: "tablet:col-span-5", 6: "tablet:col-span-6", 7: "tablet:col-span-7", 8: "tablet:col-span-8",
  9: "tablet:col-span-9", 10: "tablet:col-span-10", 11: "tablet:col-span-11", 12: "tablet:col-span-12",
};

const DESKTOP_SPAN: Record<GridColCount, string> = {
  1: "desktop:col-span-1", 2: "desktop:col-span-2", 3: "desktop:col-span-3", 4: "desktop:col-span-4",
  5: "desktop:col-span-5", 6: "desktop:col-span-6", 7: "desktop:col-span-7", 8: "desktop:col-span-8",
  9: "desktop:col-span-9", 10: "desktop:col-span-10", 11: "desktop:col-span-11", 12: "desktop:col-span-12",
};

const DESKTOP_XL_SPAN: Record<GridColCount, string> = {
  1: "desktop-xl:col-span-1", 2: "desktop-xl:col-span-2", 3: "desktop-xl:col-span-3", 4: "desktop-xl:col-span-4",
  5: "desktop-xl:col-span-5", 6: "desktop-xl:col-span-6", 7: "desktop-xl:col-span-7", 8: "desktop-xl:col-span-8",
  9: "desktop-xl:col-span-9", 10: "desktop-xl:col-span-10", 11: "desktop-xl:col-span-11", 12: "desktop-xl:col-span-12",
};

const START: Record<GridColCount, string> = {
  1: "col-start-1", 2: "col-start-2", 3: "col-start-3", 4: "col-start-4",
  5: "col-start-5", 6: "col-start-6", 7: "col-start-7", 8: "col-start-8",
  9: "col-start-9", 10: "col-start-10", 11: "col-start-11", 12: "col-start-12",
};

const DESKTOP_START: Record<GridColCount, string> = {
  1: "desktop:col-start-1", 2: "desktop:col-start-2", 3: "desktop:col-start-3", 4: "desktop:col-start-4",
  5: "desktop:col-start-5", 6: "desktop:col-start-6", 7: "desktop:col-start-7", 8: "desktop:col-start-8",
  9: "desktop:col-start-9", 10: "desktop:col-start-10", 11: "desktop:col-start-11", 12: "desktop:col-start-12",
};

const TABLET_START: Record<GridColCount, string> = {
  1: "tablet:col-start-1", 2: "tablet:col-start-2", 3: "tablet:col-start-3", 4: "tablet:col-start-4",
  5: "tablet:col-start-5", 6: "tablet:col-start-6", 7: "tablet:col-start-7", 8: "tablet:col-start-8",
  9: "tablet:col-start-9", 10: "tablet:col-start-10", 11: "tablet:col-start-11", 12: "tablet:col-start-12",
};

export const getGridItemClasses = (
  span: GridBreakpointCols | undefined,
  start: GridBreakpointCols | undefined,
  className?: string
): string =>
  cn(
    span?.base && SPAN[span.base],
    span?.mobile && MOBILE_SPAN[span.mobile],
    span?.tablet && TABLET_SPAN[span.tablet],
    span?.desktop && DESKTOP_SPAN[span.desktop],
    span?.["desktop-xl"] && DESKTOP_XL_SPAN[span["desktop-xl"]],
    start?.base && START[start.base],
    start?.tablet && TABLET_START[start.tablet],
    start?.desktop && DESKTOP_START[start.desktop],
    className
  );
