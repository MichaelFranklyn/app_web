import { cn } from "@/lib/utils";
import React from "react";
import { TopbarRootProps } from "./interface";
import { topbarRootStyles } from "./style";

export const TopbarRoot = React.forwardRef<HTMLElement, TopbarRootProps>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(topbarRootStyles.root, className)}
      {...props}
    />
  )
);

TopbarRoot.displayName = "Topbar.Root";
