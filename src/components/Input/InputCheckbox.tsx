import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { checkStyles } from "./styles";
import { Check } from "lucide-react";

export interface InputCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Cor quando marcado: "amber" (padrão, seleção) ou "green" (sucesso/concluído). */
  tone?: "amber" | "green";
}

export const InputCheckbox = forwardRef<HTMLInputElement, InputCheckboxProps>(
  ({ className, label, id: externalId, tone = "amber", ...props }, ref) => {
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
        <div className={cn(checkStyles.box, checkStyles.boxTone[tone])}>
          <Check size={10} strokeWidth={4} className={checkStyles.mark} />
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);
InputCheckbox.displayName = "InputCheckbox";
