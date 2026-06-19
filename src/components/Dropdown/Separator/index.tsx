"use client";

import { cn } from "@/lib/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React from "react";

export const Separator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-0 my-[4px] border-t border-(--border)", className)}
    {...props}
  />
));

Separator.displayName = DropdownMenuPrimitive.Separator.displayName;
