import React from "react";
import { CardAccentColor } from "../../interface";

export type { CardAccentColor };

export interface CardAccentRootProps extends React.HTMLAttributes<HTMLDivElement> {
  color: CardAccentColor;
}
