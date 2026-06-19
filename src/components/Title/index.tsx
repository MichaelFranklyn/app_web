import { cn } from "@/lib/utils";
import React, { createElement } from "react";
import { TitleProps, TitleWeight } from "./interface";
import { colorClasses, variantConfig, weightClasses } from "./style";

export const Title = React.forwardRef<HTMLElement, TitleProps>(
  ({ variant, color = "default", weight, className, children, ...props }, ref) => {
    const config = variantConfig[variant];
    const finalWeight: TitleWeight = weight ?? config.defaultWeight;

    return createElement(
      config.element,
      {
        ref,
        className: cn(
          config.className,
          colorClasses[color],
          weightClasses[finalWeight],
          "leading-relaxed",
          className
        ),
        ...props,
      },
      children
    );
  }
);

Title.displayName = "Title";
