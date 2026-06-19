import { cardHeadStyle } from "@/components/Card/style";
import { cn } from "@/lib/utils";
import React from "react";

const HeadRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(cardHeadStyle, className)} {...props} />
));

const Group = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-[10px]", className)}
    {...props}
  />
));

HeadRoot.displayName = "ImportLogCard.Head";
Group.displayName = "ImportLogCard.Head.Group";

export const Head = Object.assign(HeadRoot, {
  Group,
});
