import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { ICON_SIZE } from "@/components/Icon";

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
      data-slot="alert-icon"
      className={cn(
        // Círculo tingido pela própria cor do texto (currentColor a 12%).
        "grid size-[28px] shrink-0 place-items-center rounded-full bg-current/12",
        muted && "text-(--color-text-muted)",
        className
      )}
      {...props}
    >
      <Icon size={ICON_SIZE.md} aria-hidden />
    </div>
  )
);
AlertIcon.displayName = "AlertIcon";
