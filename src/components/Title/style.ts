import { ElementTag, TitleColor, TitleVariant, TitleWeight } from "./interface";

export const variantConfig: Record<
  TitleVariant,
  {
    element: ElementTag;
    className: string;
    defaultWeight: TitleWeight;
  }
> = {
  "heading-xl": {
    element: "h1",
    className: "font-head text-[41px] leading-none tracking-[-0.04em]",
    defaultWeight: "bold",
  },
  "heading-lg": {
    element: "h2",
    className: "font-head text-[25px] leading-none tracking-[-0.03em]",
    defaultWeight: "bold",
  },
  "heading-md": {
    element: "h3",
    className: "font-head text-[19px] leading-none tracking-[-0.02em]",
    defaultWeight: "bold",
  },
  "heading-sm": {
    element: "h4",
    className: "font-head text-[16px] leading-none tracking-[-0.01em]",
    defaultWeight: "bold",
  },
  kpi: {
    element: "strong",
    className: "font-head text-[31px] leading-none tracking-[-0.04em]",
    defaultWeight: "bold",
  },
  value: {
    element: "span",
    className: "font-head text-[14px] leading-none tracking-[-0.01em]",
    defaultWeight: "bold",
  },
  body: {
    element: "span",
    className: "font-mono text-[14px] leading-[1.6]",
    defaultWeight: "regular",
  },
  "body-md": {
    element: "p",
    className: "font-mono text-[15px] leading-[1.6]",
    defaultWeight: "regular",
  },
  "body-sm": {
    element: "p",
    className: "font-mono text-[13px] leading-[1.6]",
    defaultWeight: "regular",
  },
  "body-xs": {
    element: "span",
    className: "font-mono text-[13px] leading-[1.6]",
    defaultWeight: "regular",
  },
  caption: {
    element: "span",
    className: "font-mono text-[14px] leading-none",
    defaultWeight: "regular",
  },
  micro: {
    element: "span",
    className: "font-mono text-[13px] leading-none",
    defaultWeight: "regular",
  },
  label: {
    element: "span",
    className: "font-mono text-[13px] leading-none tracking-[0.12em] uppercase",
    defaultWeight: "regular",
  },
  eyebrow: {
    element: "p",
    className: "font-mono text-[13px] leading-none tracking-[0.12em] uppercase",
    defaultWeight: "regular",
  },
};

export const colorClasses: Record<TitleColor, string> = {
  default: "text-(--text)",
  secondary: "text-(--text2)",
  muted: "text-(--muted)",
  muted2: "text-(--muted2)",
  amber: "text-(--amber)",
  red: "text-(--red)",
  green: "text-(--green)",
  blue: "text-(--blue)",
  purple: "text-(--purple)",
  cyan: "text-(--cyan)",
  pink: "text-(--pink)",
  orange: "text-(--orange)",
};

export const weightClasses: Record<TitleWeight, string> = {
  regular: "font-(--weight-regular)",
  medium: "font-(--weight-medium)",
  semibold: "font-(--weight-semibold)",
  bold: "font-(--weight-bold)",
  extrabold: "font-(--weight-extrabold)",
};
