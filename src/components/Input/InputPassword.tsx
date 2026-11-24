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
import { ICON_SIZE } from "@/components/Icon";

export const InputPassword = ({
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
      size={size}
      required={required}
      id={props.id}
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
          className="flex cursor-pointer items-center justify-center px-3 text-(--color-text-muted) transition-colors hover:text-(--color-text)"
          onClick={toggleVisibility}
        >
          {show ? <EyeOff size={ICON_SIZE.sm} /> : <Eye size={ICON_SIZE.sm} />}
        </div>
      </InputGroup>
      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};
