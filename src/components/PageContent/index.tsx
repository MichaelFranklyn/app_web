import { cn } from "@/lib/utils";
import React from "react";

export const PageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-20 px-32 py-[28px]", className)}
    {...props}
  />
));

PageContent.displayName = "PageContent";
