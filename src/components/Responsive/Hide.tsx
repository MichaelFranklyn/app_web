import React from "react";
import { cn } from "@/lib/utils";
import { Breakpoint } from "./Show";

export interface ResponsiveHideProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: Breakpoint;
  until?: Breakpoint;
}

const fromClasses: Record<Breakpoint, string> = {
  "mobile":     "mobile:hidden",
  "tablet":     "tablet:hidden",
  "desktop":    "desktop:hidden",
  "desktop-xl": "desktop-xl:hidden",
};

// "until" on Hide means: hidden below this breakpoint (i.e. visible from it)
const untilClasses: Record<Breakpoint, string> = {
  mobile:       "hidden mobile:block",
  tablet:       "hidden tablet:block",
  desktop:      "hidden desktop:block",
  "desktop-xl": "hidden desktop-xl:block",
};

export const ResponsiveHide = React.forwardRef<HTMLDivElement, ResponsiveHideProps>(
  ({ from, until, className, children, ...props }, ref) => {
    const fromClass = from ? fromClasses[from] : undefined;
    const untilClass = until ? untilClasses[until] : undefined;

    return (
      <div
        ref={ref}
        className={cn(fromClass, untilClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveHide.displayName = "Responsive.Hide";
