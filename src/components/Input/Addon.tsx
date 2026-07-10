"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useInputContext } from "./context";
import { inputSizePadding, inputStyles } from "./styles";

interface InputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InputAddon = ({
  children,
  className,
  ...props
}: InputAddonProps) => {
  const size = useInputContext()?.size ?? "md";

  return (
    <div
      className={cn(inputStyles.addon, inputSizePadding[size], className)}
      {...props}
    >
      {children}
    </div>
  );
};
