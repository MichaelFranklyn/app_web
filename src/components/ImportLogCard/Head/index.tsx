import { cn } from "@/lib/utils";
import React from "react";

// Espelha o cabeçalho do Card do design system; mantido local para autonomia do componente.
const cardHeadStyle =
  "px-16 py-12 border-b border-(--border) flex flex-wrap items-center justify-between gap-3 min-h-[48px]";

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
