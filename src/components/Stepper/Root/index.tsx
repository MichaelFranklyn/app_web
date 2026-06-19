import { cn } from "@/lib/utils";
import React from "react";
import { Indicator } from "../Indicator";
import { StepperItem } from "../Item";
import { StepperItemProps } from "../Item/interface";
import { StepperContext } from "./context";
import { StepperRootProps } from "./interface";
import { getRootClasses, getTrackClasses } from "./style";

export const StepperRoot = React.forwardRef<HTMLDivElement, StepperRootProps>(
  (
    {
      current,
      onChange,
      orientation = "horizontal",
      size = "md",
      panelClassName,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const childArray = React.Children.toArray(children);

    const items = childArray.filter(
      (child) =>
        React.isValidElement(child) &&
        (child as React.ReactElement).type === StepperItem
    ) as React.ReactElement<StepperItemProps>[];

    const total = items.length > 0 ? items.length : childArray.length;
    const ctx = { current, total, orientation, size, onChange };

    if (items.length > 0) {
      const safeIndex = Math.min(Math.max(current, 0), items.length - 1);

      return (
        <StepperContext.Provider value={ctx}>
          <div ref={ref} className={getRootClasses(className)} {...props}>
            <div className={getTrackClasses(orientation)}>
              {items.map((item, index) => (
                <Indicator
                  key={index}
                  index={index}
                  total={items.length}
                  current={current}
                  size={size}
                  orientation={orientation}
                  label={item.props.label}
                  description={item.props.description}
                  disabled={item.props.disabled}
                  onChange={onChange}
                />
              ))}
            </div>
            <div className={cn("w-full", panelClassName)}>
              {items[safeIndex]?.props.children}
            </div>
          </div>
        </StepperContext.Provider>
      );
    }

    return (
      <StepperContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cn(getTrackClasses(orientation), className)}
          {...props}
        >
          {childArray.map((child, index) => {
            if (!React.isValidElement(child)) return child;
            return React.cloneElement(
              child as React.ReactElement<{ _index: number }>,
              { _index: index }
            );
          })}
        </div>
      </StepperContext.Provider>
    );
  }
);

StepperRoot.displayName = "Stepper.Root";
