import React from "react";
import { cn } from "@/lib/utils";
import { ThemeColor } from "@/lib/theme";

export type DotSize = "xs" | "sm" | "md" | "lg";

export interface DotProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: ThemeColor;
  size?: DotSize;
  pulse?: boolean;
}

const colorClasses: Record<ThemeColor, string> = {
  amber: "bg-(--amber)",
  red: "bg-(--red)",
  green: "bg-(--green)",
  blue: "bg-(--blue)",
  cyan: "bg-(--cyan)",
  purple: "bg-(--purple)",
  orange: "bg-(--orange)",
  pink: "bg-(--pink)",
  neutral: "bg-(--muted)",
  subtle: "bg-(--dim)",
};

const sizeClasses: Record<DotSize, string> = {
  xs: "h-1 w-1",
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export const DotRoot = React.forwardRef<HTMLDivElement, DotProps>(
  (
    { color = "amber", size = "sm", pulse = true, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "shrink-0 rounded-full opacity-60",
          colorClasses[color],
          sizeClasses[size],
          pulse && "animate-pulse-soft",
          className
        )}
        {...props}
      />
    );
  }
);

DotRoot.displayName = "Dot.Root";
