import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { checkStyles } from "./styles";
import { Check } from "lucide-react";

export interface InputCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const InputCheckbox = forwardRef<HTMLInputElement, InputCheckboxProps>(
  ({ className, label, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;

    return (
      <label htmlFor={id} className={cn(checkStyles.wrap, className)}>
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className={checkStyles.input}
          {...props}
        />
        <div className={checkStyles.box}>
          <Check size={10} strokeWidth={4} className={checkStyles.mark} />
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);
InputCheckbox.displayName = "InputCheckbox";
