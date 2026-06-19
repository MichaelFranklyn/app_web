import { cn } from "@/lib/utils";

export const tabsStyles = {
  list: "flex border-b border-(--border) mb-[24px]",
  item: cn(
    "px-[18px] py-[10px] text-[12px] text-(--muted) border-b-[2px] border-transparent",
    "cursor-pointer transition-all duration-150 mb-[-1px] outline-none",
    "hover:text-(--text2) focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--amber)",
    "data-[state=active]:text-(--amber) data-[state=active]:border-b-(--amber) data-[state=active]:font-medium"
  ),
  content:
    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in duration-300",
};
