import { InputControl } from "./Control";
import { InputHint } from "./Hint";
import { InputBaseProps } from "./InputText";
import { InputLabel } from "./Label";
import { InputRoot } from "./Root";

export interface InputTextareaProps extends Omit<InputBaseProps, "addon"> {
  rows?: number;
}

export const InputTextarea = ({
  label,
  hint,
  error,
  success,
  className,
  containerClassName,
  rows = 3,
  ...props
}: InputTextareaProps) => {
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
      <InputControl isTextarea rows={rows} className={className} {...props} />
      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};
