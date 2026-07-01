import { cn } from "@/lib/utils";
import { StepperSize } from "../Root/context";

export const circleSize: Record<StepperSize, string> = {
  sm: "h-[24px] w-[24px] text-[13px]",
  md: "h-[28px] w-[28px] text-[13px]",
};

export const iconSize: Record<StepperSize, number> = { sm: 11, md: 13 };

export const getCircleClasses = (
  size: StepperSize,
  isCompleted: boolean,
  isActive: boolean,
  isPending: boolean
): string =>
  cn(
    "flex shrink-0 items-center justify-center rounded-full font-bold transition-colors duration-[150ms]",
    circleSize[size],
    isCompleted && "bg-(--green) text-white",
    isActive && "bg-(--amber) text-white",
    isPending && "border border-(--border) bg-(--bg3) text-(--muted)"
  );

export const getButtonClasses = (
  isInteractive: boolean,
  disabled?: boolean
): string =>
  cn(
    "flex items-center gap-8 rounded-(--r-sm) outline-none transition-opacity duration-[120ms]",
    "focus-visible:ring-2 focus-visible:ring-(--amber)/40 focus-visible:ring-offset-1",
    isInteractive ? "cursor-pointer hover:opacity-70" : "cursor-default",
    disabled && "pointer-events-none opacity-40"
  );
