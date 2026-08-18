import React from "react";
import { StepperOrientation, StepperSize } from "./context";

export interface StepperRootProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  current: number;
  onChange?: (index: number) => void;
  orientation?: StepperOrientation;
  size?: StepperSize;
  /** Centraliza a trilha (padrão do wizard). Ver `Stepper.Trail`. */
  centered?: boolean;
  panelClassName?: string;
}
