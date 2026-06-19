"use client";

import React, { forwardRef } from "react";
import { IMaskInput } from "react-imask";
import type { FactoryOpts, InputMask as IMask } from "imask";
import { cn } from "@/lib/utils";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { InputHint } from "./Hint";
import { useInputContext } from "./context";
import { inputStyles } from "./styles";
import { InputBaseProps } from "./InputText";

export interface InputMaskProps extends InputBaseProps {
  mask: FactoryOpts["mask"];
  blocks?: Record<string, FactoryOpts>;
  lazy?: boolean;
  unmask?: boolean | "typed";
  onAccept?: (
    value: string,
    maskRef: IMask<FactoryOpts>,
    e?: InputEvent
  ) => void;
  onComplete?: (
    value: string,
    maskRef: IMask<FactoryOpts>,
    e?: InputEvent
  ) => void;
  dispatch?: Extract<FactoryOpts, { dispatch?: unknown }>["dispatch"];
}

const IMaskControl = forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, ...props }, ref) => {
    const context = useInputContext();

    const isError = context?.error;
    const isSuccess = context?.success;
    const inGroup = context?.inGroup;
    const disabled = context?.disabled || props.disabled;

    const computedClasses = cn(
      inputStyles.controlBase,
      inGroup ? inputStyles.controlGrouped : inputStyles.controlBordered,
      !inGroup && isError && inputStyles.error,
      !inGroup && isSuccess && inputStyles.success,
      className
    );

    // IMaskInput's props are a 24-member discriminated union keyed by mask
    // type; a generic wrapper can't narrow it, so we bridge with a single
    // precise cast (no `any`).
    const maskedProps = {
      id: context?.id,
      inputRef: ref,
      className: computedClasses,
      disabled,
      ...props,
    } as unknown as React.ComponentProps<typeof IMaskInput>;

    return <IMaskInput {...maskedProps} />;
  }
);
IMaskControl.displayName = "IMaskControl";

export const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(
  (
    {
      label,
      hint,
      error,
      success,
      addon,
      className,
      containerClassName,
      mask,
      blocks,
      lazy,
      unmask,
      onAccept,
      onComplete,
      dispatch,
      ...props
    },
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

        {addon ? (
          <InputGroup>
            <InputAddon>{addon}</InputAddon>
            <IMaskControl
              ref={ref}
              mask={mask}
              blocks={blocks}
              lazy={lazy}
              unmask={unmask}
              onAccept={onAccept}
              onComplete={onComplete}
              dispatch={dispatch}
              className={className}
              {...props}
            />
          </InputGroup>
        ) : (
          <IMaskControl
            ref={ref}
            mask={mask}
            blocks={blocks}
            lazy={lazy}
            unmask={unmask}
            onAccept={onAccept}
            onComplete={onComplete}
            dispatch={dispatch}
            className={className}
            {...props}
          />
        )}

        {hintMessage && <InputHint>{hintMessage}</InputHint>}
      </InputRoot>
    );
  }
);
InputMask.displayName = "InputMask";
