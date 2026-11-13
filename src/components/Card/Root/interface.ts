import React from "react";
import type { EventChipTone } from "@/components/EventChip/style";
import { CardAccentColor } from "../interface";

export type { CardAccentColor };

export interface CardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: CardAccentColor;
  isCompact?: boolean;
  tone?: "default" | "muted" | "transparent" | "success" | "highlight";
  inset?: boolean;
  dashed?: boolean;
  interactive?: boolean;
  elevated?: boolean;
  lift?: boolean;
  event?: EventChipTone;
  faded?: boolean;
}
