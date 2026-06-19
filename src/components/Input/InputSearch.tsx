import { Search } from "lucide-react";
import { forwardRef } from "react";
import { InputAddon } from "./Addon";
import { InputControl } from "./Control";
import { InputGroup } from "./Group";
import { InputHint } from "./Hint";
import { InputBaseProps } from "./InputText";
import { InputLabel } from "./Label";
import { InputRoot } from "./Root";

export const InputSearch = forwardRef<HTMLInputElement, InputBaseProps>(
  (
    { label, hint, error, success, className, containerClassName, ...props },
    ref
  ) => {
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
        <InputGroup>
          <InputAddon>{<Search />}</InputAddon>
          <InputControl
            ref={ref as React.Ref<HTMLInputElement>}
            type="search"
            className={className}
            {...props}
          />
        </InputGroup>
        {hintMessage && <InputHint>{hintMessage}</InputHint>}
      </InputRoot>
    );
  }
);

InputSearch.displayName = "InputSearch";
