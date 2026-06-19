"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { InputContext } from "./context";
import { inputStyles } from "./styles";

interface InputRootProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
}

export const InputRoot = ({
  children,
  className,
  id: externalId,
  error = false,
  success = false,
  disabled = false,
}: InputRootProps) => {
  const generatedId = useId();
  const id = externalId || generatedId;

  return (
    <InputContext.Provider
      value={{ id, error, success, disabled, inGroup: false }}
    >
      <div className={cn(inputStyles.wrap, className)}>{children}</div>
    </InputContext.Provider>
  );
};
