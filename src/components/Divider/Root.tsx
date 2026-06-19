import React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  diamond?: boolean;
  children?: React.ReactNode;
}

const Diamond = () => (
  <div className="my-3 h-[7px] w-[7px] shrink-0 rotate-45 border border-(--border2) bg-(--bg)" />
);

export const DividerRoot = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = "horizontal", diamond, children, className, ...props }, ref) => {
    if (orientation === "vertical") {
      if (diamond) {
        return (
          <div
            ref={ref}
            role="separator"
            aria-orientation="vertical"
            className={cn("flex flex-col items-center self-stretch", className)}
            {...props}
          >
            <div className="w-px flex-1 bg-(--border)" />
            <Diamond />
            <div className="w-px flex-1 bg-(--border)" />
          </div>
        );
      }

      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="vertical"
          className={cn("w-px self-stretch bg-(--border)", className)}
          {...props}
        />
      );
    }

    if (diamond) {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={cn("flex items-center", className)}
          {...props}
        >
          <div className="h-px flex-1 bg-(--border)" />
          <div className="mx-3 h-[7px] w-[7px] shrink-0 rotate-45 border border-(--border2) bg-(--bg)" />
          <div className="h-px flex-1 bg-(--border)" />
        </div>
      );
    }

    if (children) {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={cn("flex items-center gap-3", className)}
          {...props}
        >
          <div className="h-px flex-1 bg-(--border)" />
          <span className="font-mono text-[12px] tracking-[0.08em] text-(--muted2) uppercase">
            {children}
          </span>
          <div className="h-px flex-1 bg-(--border)" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn("h-px w-full bg-(--border)", className)}
        {...props}
      />
    );
  }
);

DividerRoot.displayName = "Divider.Root";
