import { HTMLAttributes, ReactNode } from "react";

export type TitleVariant =
  | "heading-xl"
  | "heading-lg"
  | "heading-md"
  | "heading-sm"
  | "kpi"
  | "value"
  | "body"
  | "body-md"
  | "body-sm"
  | "body-xs"
  | "caption"
  | "micro"
  | "label"
  | "eyebrow";

export type TitleColor =
  | "default"
  | "secondary"
  | "muted"
  | "muted2"
  | "amber"
  | "red"
  | "green"
  | "blue"
  | "purple"
  | "cyan"
  | "pink"
  | "orange";

export type TitleWeight =
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

export interface TitleProps extends HTMLAttributes<HTMLElement> {
  variant: TitleVariant;
  color?: TitleColor;
  weight?: TitleWeight;
  children?: ReactNode;
}

export type ElementTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "strong";
