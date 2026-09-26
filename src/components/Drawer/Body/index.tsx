import { cn } from "@/lib/utils";
import React from "react";

export function Body({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-16 overflow-y-auto px-20 py-16",
        className
      )}
      {...props}
    />
  );
}
