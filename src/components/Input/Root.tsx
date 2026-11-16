"use client";
import React, { useCallback, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { InputContext } from "./context";
import { InputSize, inputStyles } from "./styles";

interface InputRootProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  size?: InputSize;
  required?: boolean;
}

export const InputRoot = ({
  children,
  className,
  id: externalId,
  error = false,
  success = false,
  disabled = false,
  size = "md",
  required = false,
}: InputRootProps) => {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [hasHint, setHasHint] = useState(false);
  const registerHint = useCallback(
    (mounted: boolean) => setHasHint(mounted),
    []
  );
  const hintId = hasHint ? `${id}-hint` : undefined;

  return (
    <InputContext.Provider
      value={{
        id,
        error,
        success,
        disabled,
        inGroup: false,
        size,
        required,
        hintId,
        registerHint,
      }}
    >
      <div data-input-root className={cn(inputStyles.wrap, className)}>
        {children}
      </div>
    </InputContext.Provider>
  );
};
