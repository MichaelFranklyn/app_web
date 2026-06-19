"use client";

import React, { useState } from "react";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputControl } from "./Control";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { InputHint } from "./Hint";
import { InputBaseProps } from "./InputText";
import { Eye, EyeOff } from "lucide-react";

export const InputPassword = ({
  label,
  hint,
  error,
  success,
  addon,
  className,
  containerClassName,
  ...props
}: InputBaseProps) => {
  const [show, setShow] = useState(false);
  const isError = !!error;
  const hintMessage = typeof error === "string" ? error : hint;

  const toggleVisibility = () => setShow(!show);

  return (
    <InputRoot
      error={isError}
      success={success}
      disabled={props.disabled}
      className={containerClassName}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <InputGroup>
        {addon && <InputAddon>{addon}</InputAddon>}
        <InputControl
          type={show ? "text" : "password"}
          className={className}
          {...props}
        />
        <div
          className="flex cursor-pointer items-center justify-center px-3 text-(--muted) transition-colors hover:text-(--text)"
          onClick={toggleVisibility}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </div>
      </InputGroup>
      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};
