import { cn } from "@/lib/utils";
import React from "react";
import { TopbarActionsProps } from "./interface";

export const TopbarActions = React.forwardRef<HTMLDivElement, TopbarActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-[10px]", className)}
      {...props}
    />
  )
);

TopbarActions.displayName = "Topbar.Actions";
