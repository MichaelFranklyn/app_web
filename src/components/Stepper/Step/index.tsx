import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";
import { useStepperContext } from "../Root/context";
import { StepperStepInternalProps, StepperStepProps } from "./interface";
import { getButtonBaseClasses, getIndicatorClasses, iconSize } from "./style";

export const StepperStep = React.forwardRef<
  HTMLButtonElement,
  StepperStepProps
>(({ label, description, disabled, className, onClick, ...props }, ref) => {
  const { _index = 0, ...rest } = props as StepperStepInternalProps;
  const divRest = rest as React.HTMLAttributes<HTMLDivElement>;
  const { current, total, orientation, size, onChange } = useStepperContext();

  const isCompleted = _index < current;
  const isActive = _index === current;
  const isPending = _index > current;
  const isLast = _index === total - 1;
  const isInteractive = !!onChange && !disabled;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (isInteractive && !isActive) onChange?.(_index);
  };

  const indicator = (
    <div
      className={getIndicatorClasses(size, isCompleted, isActive, isPending)}
    >
      {isCompleted ? <Check size={iconSize[size]} /> : _index + 1}
    </div>
  );

  const labelEl = (
    <div className="flex flex-col">
      <Title
        variant="caption"
        weight={isActive ? "semibold" : "regular"}
        color={isActive ? "default" : isPending ? "muted" : "secondary"}
        className="whitespace-nowrap"
      >
        {label}
      </Title>
      {description && (
        <Title variant="caption" color="muted" className="whitespace-nowrap">
          {description}
        </Title>
      )}
    </div>
  );

  const buttonBase = getButtonBaseClasses(isInteractive, isActive, disabled);

  if (orientation === "vertical") {
    return (
      <div className={cn("flex gap-3", className)} {...divRest}>
        <div className="flex flex-col items-center">
          <button
            ref={ref}
            type="button"
            onClick={handleClick}
            disabled={disabled || !isInteractive}
            className={buttonBase}
            aria-current={isActive ? "step" : undefined}
          >
            {indicator}
          </button>
          {!isLast && (
            <div
              className="mt-1 w-px flex-1 bg-(--border)"
              style={{ minHeight: 20 }}
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || !isInteractive}
          className={cn(buttonBase, "pt-[2px]", !isLast && "pb-6")}
          tabIndex={-1}
          aria-hidden
        >
          {labelEl}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex shrink-0 items-center", className)} {...divRest}>
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabled || !isInteractive}
        className={buttonBase}
        aria-current={isActive ? "step" : undefined}
      >
        {indicator}
        {labelEl}
      </button>
      {!isLast && <div className="mx-3 h-px w-8 shrink-0 bg-(--border)" />}
    </div>
  );
});

StepperStep.displayName = "Stepper.Step";
