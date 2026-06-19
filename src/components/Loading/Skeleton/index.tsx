import { cn } from "@/lib/utils";
import React from "react";

export const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-(--r-sm) bg-(--bg3)", className)}
    {...props}
  />
));

Skeleton.displayName = "Loading.Skeleton";
