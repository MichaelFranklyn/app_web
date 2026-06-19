import { cn } from "@/lib/utils";
import React from "react";
import { ProgressRootProps } from "./interface";

export const Root = React.forwardRef<HTMLDivElement, ProgressRootProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex w-full flex-col gap-[5px]", className)}
      {...props}
    />
  )
);

Root.displayName = "Progress.Root";
