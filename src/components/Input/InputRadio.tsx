import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { radioStyles } from "./styles";

export interface InputRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const InputRadio = forwardRef<HTMLInputElement, InputRadioProps>(
  ({ className, label, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;

    return (
      <label htmlFor={id} className={cn(radioStyles.wrap, className)}>
        <input
          type="radio"
          id={id}
          ref={ref}
          className={radioStyles.input}
          {...props}
        />
        <div className={radioStyles.box}>
          <div className={radioStyles.dot} />
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);
InputRadio.displayName = "InputRadio";
