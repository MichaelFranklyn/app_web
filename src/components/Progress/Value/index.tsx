import { cn } from "@/lib/utils";
import React from "react";
import { ProgressColor } from "../Root/interface";
import { PROGRESS_COLOR_TOKENS } from "../Root/style";

interface ProgressValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: ProgressColor;
}

export const Value = React.forwardRef<HTMLSpanElement, ProgressValueProps>(
  ({ color, className, style, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("font-head text-[13px] font-bold", className)}
      style={{
        color: color ? PROGRESS_COLOR_TOKENS[color] : "var(--text)",
        ...style,
      }}
      {...props}
    />
  )
);

Value.displayName = "Progress.Value";
