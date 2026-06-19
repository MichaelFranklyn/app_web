import React from "react";
import { cn } from "@/lib/utils";

const InfoRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("min-w-0 flex-1", className)} {...props} />
));

const InfoName = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "truncate text-[13px] font-medium text-(--text)",
      className
    )}
    {...props}
  />
));

const InfoMeta = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-[2px] text-[12px] text-(--muted)", className)}
    {...props}
  />
));

InfoRoot.displayName = "ImportLogCard.Info";
InfoName.displayName = "ImportLogCard.Info.Name";
InfoMeta.displayName = "ImportLogCard.Info.Meta";

export const Info = Object.assign(InfoRoot, {
  Name: InfoName,
  Meta: InfoMeta,
});
