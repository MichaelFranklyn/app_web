import React from "react";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputControl, InputControlProps } from "./Control";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { InputHint } from "./Hint";
import { InputSize } from "./styles";

// `size` sombreia o atributo nativo do <input> (largura em caracteres), que não
// usamos: aqui ele é a altura do controle, alinhada a Button e Badge.
export interface InputBaseProps extends Omit<InputControlProps, "size"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: boolean | string;
  success?: boolean;
  addon?: React.ReactNode;
  containerClassName?: string;
  size?: InputSize;
}

export const InputText = ({
  label,
  hint,
  error,
  success,
  addon,
  className,
  containerClassName,
  size,
  required,
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
      size={size}
      required={required}
      id={props.id}
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
