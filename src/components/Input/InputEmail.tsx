import React from "react";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputControl } from "./Control";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { InputHint } from "./Hint";
import { InputBaseProps } from "./InputText";

export const InputEmail = ({
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
          {/* Validação de email nativa via type */}
          <InputControl type="email" className={className} {...props} />
        </InputGroup>
      ) : (
        <InputControl type="email" className={className} {...props} />
      )}
      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};
