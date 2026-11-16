import { cn } from "@/lib/utils";
import { TopbarStatusVariant } from "./interface";

export const statusVariants: Record<
  TopbarStatusVariant,
  { root: string; dot: string }
> = {
  online: {
    root: "text-(--color-status-success)",
    dot: "bg-(--color-status-success)",
  },
  offline: {
    root: "text-(--color-status-danger)",
    dot: "bg-(--color-status-danger)",
  },
  warning: {
    root: "text-(--color-action-text)",
    dot: "bg-(--amber)",
  },
};

export const getStatusClasses = (variant: TopbarStatusVariant) => ({
  root: cn(
    "flex items-center gap-[6px] text-body-sm",
    statusVariants[variant].root
  ),
  dot: cn(
    "h-[6px] w-[6px] shrink-0 rounded-full animate-pulse-soft",
    statusVariants[variant].dot
  ),
});
