import { cn } from "@/lib/utils";
import React from "react";

const SPACING = {
  sm: "gap-8 [&>li]:pb-8",
  md: "gap-16 [&>li]:pb-16",
} as const;

interface RowListRootProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Respiro entre as linhas (o mesmo em cima e embaixo do traço). */
  spacing?: keyof typeof SPACING;
}

/**
 * Lista de linhas separadas por um traço, sem moldura — dentro de um card que
 * já dá a borda. O traço some na última linha.
 */
const Root = ({ spacing = "sm", className, ...props }: RowListRootProps) => (
  <ul className={cn("flex flex-col", SPACING[spacing], className)} {...props} />
);

const Item = ({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li
    className={cn(
      "border-b border-(--border) last:border-0 last:pb-0",
      className
    )}
    {...props}
  />
);

export const RowList = { Root, Item };
