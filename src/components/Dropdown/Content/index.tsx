"use client";

import { cn } from "@/lib/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React from "react";

interface DropdownContentProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> {
  sideOffset?: number;
  /** Painel (notificações): sem o respiro vertical de menu, em coluna. */
  panel?: boolean;
}

export const Content = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownContentProps
>(({ className, sideOffset = 6, panel = false, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[160px] border border-(--border) bg-(--bg2)",
        "rounded-(--r-lg) shadow-(--shadow-lg)",
        panel ? "flex flex-col" : "py-4",
        // Cresce a partir do gatilho (a origem vem do Radix, pelo lado em que
        // o menu abriu). O `animate-in` do plugin antigo não gerava CSS.
        "origin-(--radix-dropdown-menu-content-transform-origin)",
        "animate-pop-in data-[state=closed]:animate-pop-out",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

Content.displayName = DropdownMenuPrimitive.Content.displayName;
