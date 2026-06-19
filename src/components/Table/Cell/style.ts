export const tableCellBase =
  "p-16 align-middle border-b border-(--border) group-last:border-b-0";

export const tableCellFlex = "flex items-center gap-8";

export const tableCellVariants = {
  default: "text-(--text2)",
  strong: "text-(--text) font-medium",
  mono: "font-mono text-(--text2)",
  dim: "text-(--muted) text-[13px]",
  dim2: "text-(--muted2) text-[12px]",
} as const;
