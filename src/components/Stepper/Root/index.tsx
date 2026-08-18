import { cn } from "@/lib/utils";
import React from "react";
import { StepperItem } from "../Item";
import { StepperItemProps } from "../Item/interface";
import { StepperTrail } from "../Trail";
import { StepperTrailStep } from "../Trail/interface";
import { StepperContext } from "./context";
import { StepperRootProps } from "./interface";
import { getRootClasses } from "./style";

/**
 * Wizard completo: a trilha de marcos (delegada a `Stepper.Trail`) mais o
 * conteúdo do passo atual, declarado em `Stepper.Item`.
 */
export const StepperRoot = React.forwardRef<HTMLDivElement, StepperRootProps>(
  (
    {
      current,
      onChange,
      orientation = "horizontal",
      size = "md",
      centered = true,
      panelClassName,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const items = React.Children.toArray(children).filter(
      (child) =>
        React.isValidElement(child) &&
        (child as React.ReactElement).type === StepperItem
    ) as React.ReactElement<StepperItemProps>[];

    const steps: StepperTrailStep[] = items.map((item) => ({
      label: item.props.label,
      description: item.props.description,
      disabled: item.props.disabled,
    }));

    const safeIndex = Math.min(Math.max(current, 0), items.length - 1);

    return (
      <StepperContext.Provider
        value={{ current, total: items.length, orientation, size, onChange }}
      >
        <div ref={ref} className={getRootClasses(className)} {...props}>
          <StepperTrail
            steps={steps}
            current={current}
            onChange={onChange}
            orientation={orientation}
            size={size}
            centered={centered}
          />
          <div className={cn("w-full", panelClassName)}>
            {items[safeIndex]?.props.children}
          </div>
        </div>
      </StepperContext.Provider>
    );
  }
);

StepperRoot.displayName = "Stepper.Root";
