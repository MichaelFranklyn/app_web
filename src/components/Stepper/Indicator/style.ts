import { cn } from "@/lib/utils";
import { StepperSize } from "../Root/context";

export const circleSize: Record<StepperSize, string> = {
  sm: "h-[24px] w-[24px] text-body-sm",
  md: "h-[28px] w-[28px] text-body-sm",
};

export const iconSize: Record<StepperSize, number> = { sm: 11, md: 13 };

export const getCircleClasses = (
  size: StepperSize,
  isCompleted: boolean,
  isActive: boolean,
  isPending: boolean
): string =>
  cn(
    "flex shrink-0 items-center justify-center rounded-full font-(--weight-semibold) transition-[background-color,color,box-shadow] duration-[150ms]",
    circleSize[size],
    isCompleted && "bg-(--color-status-success) text-white",
    // Fundo de ação, não o --amber puro: número branco sobre #c97f0a dava
    // 3,21:1 (mesma correção do "hoje" do Calendar). O halo diz "você está aqui".
    isActive &&
      "bg-(--color-action) text-(--color-on-action) ring-[3px] ring-(--amber)/20",
    isPending &&
      "border border-(--border2) bg-(--bg2) text-(--color-text-muted)"
  );

export const getButtonClasses = (
  isInteractive: boolean,
  disabled?: boolean
): string =>
  cn(
    "-m-[4px] flex items-center gap-8 rounded-(--r-md) p-[4px] pr-[8px] focus-ring transition-colors duration-[120ms]",
    isInteractive ? "cursor-pointer hover:bg-(--bg3)" : "cursor-default",
    // Sem opacity: o texto do passo travado vai para --color-text-disabled
    // (o Indicator passa a cor ao Title).
    disabled && "pointer-events-none"
  );
