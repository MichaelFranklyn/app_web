import { createContext, useContext } from "react";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperSize = "sm" | "md";

export interface StepperContextValue {
  current: number;
  total: number;
  orientation: StepperOrientation;
  size: StepperSize;
  onChange?: (index: number) => void;
}

export const StepperContext = createContext<StepperContextValue>({
  current: 0,
  total: 0,
  orientation: "horizontal",
  size: "md",
  onChange: undefined,
});

export const useStepperContext = () => useContext(StepperContext);
