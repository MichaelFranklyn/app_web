import { ResponsiveBox } from "./Box";
import { ResponsiveHide } from "./Hide";
import { ResponsiveShow } from "./Show";

export const Responsive = {
  Box: ResponsiveBox,
  Show: ResponsiveShow,
  Hide: ResponsiveHide,
};

export type { Breakpoint, DisplayType, ResponsiveShowProps } from "./Show";
export type { ResponsiveHideProps } from "./Hide";
export type { ResponsiveBoxProps } from "./Box";
