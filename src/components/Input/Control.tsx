"use client";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { useInputContext } from "./context";
import { inputStyles } from "./styles";

export interface InputControlProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isTextarea?: boolean;
  rows?: number;
}

export const InputControl = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputControlProps
>(({ className, isTextarea, ...props }, ref) => {
  const context = useInputContext();

  const isError = context?.error;
  const isSuccess = context?.success;
  const inGroup = context?.inGroup;
  const disabled = context?.disabled || props.disabled;

  const computedClasses = cn(
    inputStyles.controlBase,
    inGroup ? inputStyles.controlGrouped : inputStyles.controlBordered,
    !inGroup && isError && inputStyles.error,
    !inGroup && isSuccess && inputStyles.success,
    isTextarea && inputStyles.textarea,
    className
  );

  if (isTextarea) {
    return (
      <textarea
        id={context?.id}
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={computedClasses}
        disabled={disabled}
        {...(props as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  return (
    <input
      id={context?.id}
      ref={ref as React.Ref<HTMLInputElement>}
      className={computedClasses}
      disabled={disabled}
      {...props}
    />
  );
});

InputControl.displayName = "InputControl";
