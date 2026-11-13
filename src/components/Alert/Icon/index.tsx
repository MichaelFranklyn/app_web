import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface AlertIconProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  icon: LucideIcon;
  /** Ícone só de contexto (distância, tempo): cinza, sem a cor do alerta. */
  muted?: boolean;
}

export const AlertIcon = React.forwardRef<HTMLDivElement, AlertIconProps>(
  ({ icon: Icon, muted = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("shrink-0", muted && "text-(--muted)", className)}
      {...props}
    >
      <Icon size={16} />
    </div>
  )
);
AlertIcon.displayName = "AlertIcon";
