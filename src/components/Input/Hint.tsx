"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { useInputContext } from "./context";
import { inputStyles } from "./styles";

interface InputHintProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const InputHint = ({
  children,
  className,
  ...props
}: InputHintProps) => {
  const context = useInputContext();
  const isError = context?.error;

  return (
    <span
      className={cn(
        inputStyles.hint,
        isError && inputStyles.hintError,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
