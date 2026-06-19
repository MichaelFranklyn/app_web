"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { useInputContext } from "./context";
import { inputStyles } from "./styles";

interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const InputLabel = ({
  children,
  className,
  ...props
}: InputLabelProps) => {
  const context = useInputContext();

  return (
    <label
      htmlFor={context?.id}
      className={cn(inputStyles.label, className)}
      {...props}
    >
      {children}
    </label>
  );
};
