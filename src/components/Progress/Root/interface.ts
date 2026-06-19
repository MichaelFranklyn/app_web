import React from "react";

export type ProgressColor = "amber" | "green" | "red" | "blue" | "cyan";

export type ProgressRootProps = React.HTMLAttributes<HTMLDivElement>;

export interface ProgressProps extends ProgressRootProps {
  value: number;
  color?: ProgressColor;
}
