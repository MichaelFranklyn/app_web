import { cn } from "@/lib/utils";

export const topbarRootStyles = {
  root: cn(
    "sticky top-0 z-10 flex h-[52px] w-full shrink-0 items-center justify-between gap-12",
    "border-b border-(--border) bg-(--bg) px-16 tablet:px-24"
  ),
};
