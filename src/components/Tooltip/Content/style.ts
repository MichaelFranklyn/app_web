import { cn } from "@/lib/utils";

export const tooltipContentStyles = {
  content: cn(
    "z-50 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 duration-200",
    "bg-(--bg4) border border-(--border2) rounded-(--r-md) px-[10px] py-[5px]",
    "text-[12px] text-(--text) whitespace-nowrap shadow-(--shadow-sm)"
  ),
  arrow: "fill-(--border2)",
};
