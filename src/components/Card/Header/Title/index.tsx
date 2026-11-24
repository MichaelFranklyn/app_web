import { cn } from "@/lib/utils";
import React from "react";
import { CardHeaderTitleProps } from "./interface";
import { titleStyle } from "./style";

export const HeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  CardHeaderTitleProps
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn(titleStyle, className)} {...props} />
));

HeaderTitle.displayName = "Card.Header.Title";
