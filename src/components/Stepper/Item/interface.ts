import { ReactNode } from "react";

export interface StepperItemProps {
  label: string;
  description?: string;
  disabled?: boolean;
  children?: ReactNode;
}
