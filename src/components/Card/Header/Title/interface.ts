import React from "react";
import { VariantProps } from "class-variance-authority";
import { titleStyle } from "./style";

export interface CardHeaderTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleStyle> {}
