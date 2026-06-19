"use client";

import { cn } from "@/lib/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React from "react";
import { itemVariants } from "./style";

interface DropdownItemProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> {
  danger?: boolean;
  icon?: React.ElementType;
}

export const Item = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownItemProps
>(({ className, danger, icon: Icon, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(itemVariants({ danger }), className)}
    {...props}
  >
    {Icon && <Icon size={14} strokeWidth={1.5} />}
    {children}
  </DropdownMenuPrimitive.Item>
));

Item.displayName = DropdownMenuPrimitive.Item.displayName;
