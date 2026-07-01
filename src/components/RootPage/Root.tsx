import { cn } from "@/lib/utils";
import React from "react";

interface RootPageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const RootPageRoot = React.forwardRef<HTMLDivElement, RootPageProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("min-h-screen w-full bg-(--bg)", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

RootPageRoot.displayName = "RootPage.Root";
