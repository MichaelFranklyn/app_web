import React from "react";
import { CardAccentColor } from "../../interface";

export interface CardAccentLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: CardAccentColor;
}
