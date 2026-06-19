import React from "react";
import { CardBg } from "../interface";

export type CardFooterBg = CardBg;

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bg?: CardFooterBg;
}
