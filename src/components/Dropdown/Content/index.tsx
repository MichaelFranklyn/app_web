"use client";

import { cn } from "@/lib/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React from "react";

interface DropdownContentProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> {
  sideOffset?: number;
}

export const Content = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownContentProps
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[160px] border border-(--border) bg-(--bg2)",
        "rounded-(--r-lg) py-4 shadow-(--shadow-md)",
        "animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 duration-200",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

Content.displayName = DropdownMenuPrimitive.Content.displayName;
