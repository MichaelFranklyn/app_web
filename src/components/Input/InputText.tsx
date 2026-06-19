import React from "react";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputControl, InputControlProps } from "./Control";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { InputHint } from "./Hint";

export interface InputBaseProps extends InputControlProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: boolean | string;
  success?: boolean;
  addon?: React.ReactNode;
  containerClassName?: string;
}

export const InputText = ({
  label,
  hint,
  error,
  success,
  addon,
  className,
  containerClassName,
  ...props
}: InputBaseProps) => {
  const isError = !!error;
  const hintMessage = typeof error === "string" ? error : hint;

  return (
    <InputRoot
      error={isError}
      success={success}
      disabled={props.disabled}
      className={containerClassName}
    >
      {label && <InputLabel>{label}</InputLabel>}
      {addon ? (
        <InputGroup>
          <InputAddon>{addon}</InputAddon>
          <InputControl type="text" className={className} {...props} />
        </InputGroup>
      ) : (
        <InputControl type="text" className={className} {...props} />
      )}
      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};
