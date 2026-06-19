import React from "react";
import { cn } from "@/lib/utils";

export type Breakpoint = "mobile" | "tablet" | "desktop" | "desktop-xl";
export type DisplayType = "block" | "flex" | "inline" | "inline-flex" | "grid";

export interface ResponsiveShowProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: Breakpoint;
  until?: Breakpoint;
  display?: DisplayType;
}

// Fully static class maps — Tailwind can detect these at build time
const fromClasses: Record<Breakpoint, Record<DisplayType, string>> = {
  mobile:       { block: "hidden mobile:block",      flex: "hidden mobile:flex",      inline: "hidden mobile:inline",      "inline-flex": "hidden mobile:inline-flex",      grid: "hidden mobile:grid"      },
  tablet:       { block: "hidden tablet:block",      flex: "hidden tablet:flex",      inline: "hidden tablet:inline",      "inline-flex": "hidden tablet:inline-flex",      grid: "hidden tablet:grid"      },
  desktop:      { block: "hidden desktop:block",     flex: "hidden desktop:flex",     inline: "hidden desktop:inline",     "inline-flex": "hidden desktop:inline-flex",     grid: "hidden desktop:grid"     },
  "desktop-xl": { block: "hidden desktop-xl:block",  flex: "hidden desktop-xl:flex",  inline: "hidden desktop-xl:inline",  "inline-flex": "hidden desktop-xl:inline-flex",  grid: "hidden desktop-xl:grid"  },
};

const untilClasses: Record<Breakpoint, string> = {
  "mobile":     "mobile:hidden",
  "tablet":     "tablet:hidden",
  "desktop":    "desktop:hidden",
  "desktop-xl": "desktop-xl:hidden",
};

export const ResponsiveShow = React.forwardRef<HTMLDivElement, ResponsiveShowProps>(
  ({ from, until, display = "block", className, children, ...props }, ref) => {
    const fromClass = from ? fromClasses[from][display] : undefined;
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

ResponsiveShow.displayName = "Responsive.Show";
