import { cn } from "@/lib/utils";
import { TopbarStatusVariant } from "./interface";

export const statusVariants: Record<
  TopbarStatusVariant,
  { root: string; dot: string }
> = {
  online: {
    root: "text-(--green)",
    dot: "bg-(--green)",
  },
  offline: {
    root: "text-(--red)",
    dot: "bg-(--red)",
  },
  warning: {
    root: "text-(--amber)",
    dot: "bg-(--amber)",
  },
};

export const getStatusClasses = (variant: TopbarStatusVariant) => ({
  root: cn("flex items-center gap-[6px] text-[12px]", statusVariants[variant].root),
  dot: cn(
    "h-[6px] w-[6px] shrink-0 rounded-full animate-pulse-soft",
    statusVariants[variant].dot
  ),
});
