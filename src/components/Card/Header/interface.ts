import React from "react";
import { CardBg } from "../interface";

export type CardHeaderBg = CardBg;

export interface CardHeaderRootProps extends React.HTMLAttributes<HTMLDivElement> {
  bg?: CardHeaderBg;
}
