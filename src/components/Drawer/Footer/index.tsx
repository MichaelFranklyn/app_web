import { cn } from "@/lib/utils";
import React from "react";

export function Footer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 border-t border-(--border) px-20 py-16",
        className
      )}
      {...props}
    />
  );
}
