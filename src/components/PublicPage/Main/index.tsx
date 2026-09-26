import { cn } from "@/lib/utils";
import React from "react";
import { PUBLIC_PAGE_CONTAINER } from "../style";

export const Main = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <main
    ref={ref}
    className={cn(PUBLIC_PAGE_CONTAINER, "flex-1 py-[24px]", className)}
    {...props}
  />
));

Main.displayName = "PublicPage.Main";
