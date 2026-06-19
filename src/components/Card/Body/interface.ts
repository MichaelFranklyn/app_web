import React from "react";
import { VariantProps } from "class-variance-authority";
import { bodyStyle } from "./style";

export interface CardBodyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bodyStyle> {}
