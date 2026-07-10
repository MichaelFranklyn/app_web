import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ButtonTitleProps {
  children: ReactNode;
  className?: string;
}

export const ButtonTitle = ({ children, className }: ButtonTitleProps) => (
  <span data-button-title className={cn(className)}>
    {children}
  </span>
);
ButtonTitle.displayName = "Button.Title";
