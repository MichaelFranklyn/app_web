import * as React from "react";
import { BadgeProps } from "./interface";
import { getBadgeClasses } from "./style";

export const BadgeRoot = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      color = "neutral",
      appearance = "tinted",
      size = "xs",
      fullWidth,
      className,
      ...props
    },
    ref
  ) => (
    <span
      ref={ref}
      data-badge
      className={getBadgeClasses(color, appearance, size, fullWidth, className)}
      {...props}
    >
      {children}
    </span>
  )
);
BadgeRoot.displayName = "Badge.Root";
