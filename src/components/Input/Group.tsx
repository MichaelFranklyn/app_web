"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { InputContext, useInputContext } from "./context";
import { inputStyles } from "./styles";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InputGroup = ({
  children,
  className,
  ...props
}: InputGroupProps) => {
  const context = useInputContext();
  const isError = context?.error;
  const isSuccess = context?.success;

  return (
    <InputContext.Provider value={{ ...context, inGroup: true }}>
      <div
        className={cn(
          inputStyles.group,
          isError && inputStyles.groupError,
          isSuccess && inputStyles.groupSuccess,
          className
        )}
        {...props}
      >
        {children}
      </div>
    </InputContext.Provider>
  );
};
