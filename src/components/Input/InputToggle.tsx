import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { toggleStyles } from "./styles";

export interface InputToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const InputToggle = forwardRef<HTMLInputElement, InputToggleProps>(
  ({ className, label, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;

    return (
      <label htmlFor={id} className={cn(toggleStyles.wrap, className)}>
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className={toggleStyles.input}
          {...props}
        />
        <div className={toggleStyles.track}>
          <div className={toggleStyles.thumb} />
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);
InputToggle.displayName = "InputToggle";
