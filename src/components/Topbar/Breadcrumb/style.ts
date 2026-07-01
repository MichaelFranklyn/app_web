import { cn } from "@/lib/utils";

export const topbarBreadcrumbStyles = {
  root: cn("flex flex-1 items-center gap-[6px] text-[13px] text-(--muted)"),
  current: "text-(--text) font-(--weight-semibold)",
  separator: "select-none text-(--muted)",
};
