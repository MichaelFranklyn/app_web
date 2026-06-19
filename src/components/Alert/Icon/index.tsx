import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface AlertIconProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  icon: LucideIcon;
}

export const AlertIcon = React.forwardRef<HTMLDivElement, AlertIconProps>(
  ({ icon: Icon, className, ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0", className)} {...props}>
      <Icon size={16} />
    </div>
  )
);
AlertIcon.displayName = "AlertIcon";
