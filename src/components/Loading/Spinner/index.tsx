"use client";

import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import React from "react";

const spinnerVariants = cva("animate-spin shrink-0", {
  variants: {
    size: {
      sm: "w-3 h-3",
      md: "w-5 h-5",
      lg: "w-8 h-8",
    },
    colorClass: {
      default: "text-(--muted)",
      amber: "text-(--amber)",
      blue: "text-(--blue)",
      red: "text-(--red)",
      green: "text-(--green)",
    },
  },
  defaultVariants: {
    size: "md",
    colorClass: "default",
  },
});

interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  colorClass?: "default" | "amber" | "blue" | "red" | "green";
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, colorClass, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        <Loader2
          className={cn(spinnerVariants({ size, colorClass }), className)}
        />
      </div>
    );
  }
);

Spinner.displayName = "Loading.Spinner";
