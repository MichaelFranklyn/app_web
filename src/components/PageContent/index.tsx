import { cn } from "@/lib/utils";
import React from "react";

export const PageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "tablet:px-32 tablet:py-[28px] flex flex-col gap-20 px-16 py-20",
      className
    )}
    {...props}
  />
));

PageContent.displayName = "PageContent";
