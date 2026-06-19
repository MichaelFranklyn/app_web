import React from "react";
import { cn } from "@/lib/utils";
import { inputStyles } from "./styles";

interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InputAddon = ({
  children,
  className,
  ...props
}: InputAddonProps) => {
  return (
    <div className={cn(inputStyles.addon, className)} {...props}>
      {children}
    </div>
  );
};
