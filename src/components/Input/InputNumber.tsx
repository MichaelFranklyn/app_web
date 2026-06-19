import React from "react";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputControl } from "./Control";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { InputHint } from "./Hint";
import { InputBaseProps } from "./InputText";

export const InputNumber = ({
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
          <InputControl
            type="number"
            className={className}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
              props.onKeyDown?.(e);
            }}
            {...props}
          />
        </InputGroup>
      ) : (
        <InputControl
          type="number"
          className={className}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) {
              e.preventDefault();
            }
            props.onKeyDown?.(e);
          }}
          {...props}
        />
      )}
      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};
