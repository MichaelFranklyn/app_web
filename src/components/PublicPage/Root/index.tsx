import { cn } from "@/lib/utils";
import React from "react";

export const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex min-h-screen flex-col bg-(--bg)", className)}
    {...props}
  />
));

Root.displayName = "PublicPage.Root";
