import { cn } from "@/lib/utils";
import { StepperOrientation } from "./context";

export const getRootClasses = (className?: string): string =>
  cn("flex flex-col gap-16", className);

export const getTrackClasses = (orientation: StepperOrientation): string =>
  orientation === "horizontal"
    ? "flex items-center justify-center overflow-x-auto"
    : "flex flex-col";
