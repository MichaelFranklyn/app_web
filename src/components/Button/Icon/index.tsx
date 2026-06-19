import { cn } from "@/lib/utils";
import { ElementType } from "react";
import { useButtonContext } from "../Root/context";
import { iconPixelSizes } from "../Root/style";

interface ButtonIconProps {
  icon: ElementType;
  className?: string;
}

export const ButtonIcon = ({ icon: Icon, className }: ButtonIconProps) => {
  const { size, loading } = useButtonContext();

  if (loading) return null;

  return (
    <Icon
      size={iconPixelSizes[size]}
      strokeWidth={2.5}
      className={cn("shrink-0", className)}
    />
  );
};
ButtonIcon.displayName = "Button.Icon";
