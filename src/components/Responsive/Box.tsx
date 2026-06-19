import React from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  base?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
  desktopXl?: string;
}

export const ResponsiveBox = React.forwardRef<HTMLDivElement, ResponsiveBoxProps>(
  ({ base, mobile, tablet, desktop, desktopXl, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(base, mobile, tablet, desktop, desktopXl, className)}
      {...props}
    >
      {children}
    </div>
  )
);

ResponsiveBox.displayName = "Responsive.Box";
