import React from "react";
import { CardItemValueColor } from "../Value/style";

export interface CardItemRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: "list" | "stat";
  size?: "default" | "compact";
  bordered?: boolean;
  label?: string;
  value?: React.ReactNode;
  color?: CardItemValueColor;
}
