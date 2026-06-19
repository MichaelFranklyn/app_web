import React from "react";
import { VariantProps } from "class-variance-authority";
import { valueStyle } from "./style";

export interface CardItemValueProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof valueStyle> {}
