import React from "react";
import { CardAccentColor } from "../interface";

export type { CardAccentColor };

export interface CardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: CardAccentColor;
  isCompact?: boolean;
  tone?: "default" | "muted" | "transparent" | "success";
  inset?: boolean;
  dashed?: boolean;
  interactive?: boolean;
}
