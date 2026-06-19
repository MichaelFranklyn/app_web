import React from "react";

export interface StepperStepProps extends React.HTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface StepperStepInternalProps extends StepperStepProps {
  _index: number;
}
