import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { StepperOrientation, StepperSize } from "../Root/context";
import { getButtonClasses, getCircleClasses, iconSize } from "./style";

interface IndicatorProps {
  index: number;
  total: number;
  current: number;
  size: StepperSize;
  orientation: StepperOrientation;
  label: string;
  description?: string;
  disabled?: boolean;
  onChange?: (index: number) => void;
}

export const Indicator = ({
  index,
  total,
  current,
  size,
  orientation,
  label,
  description,
  disabled,
  onChange,
}: IndicatorProps) => {
  const isCompleted = index < current;
  const isActive = index === current;
  const isPending = index > current;
  const isLast = index === total - 1;
  const isInteractive = !!onChange && !disabled && !isActive;

  const handleClick = () => {
    if (isInteractive) onChange!(index);
  };

  const circle = (
    <div className={getCircleClasses(size, isCompleted, isActive, isPending)}>
      {isCompleted ? <Check size={iconSize[size]} /> : index + 1}
    </div>
  );

  const text = (
    <div className="flex flex-col">
      <Title
        variant="caption"
        weight={isActive ? "semibold" : "regular"}
        color={isActive ? "default" : isPending ? "muted" : "secondary"}
        className={cn(
          "whitespace-nowrap",
          // Passo travado: cor de desabilitado, nunca opacity.
          disabled && "text-(--color-text-disabled)"
        )}
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

  const btnClass = getButtonClasses(isInteractive, disabled);

  if (orientation === "vertical") {
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleClick}
            disabled={!isInteractive}
            className={btnClass}
            aria-current={isActive ? "step" : undefined}
          >
            {circle}
          </button>
          {!isLast && (
            <div
              className={cn(
                "mt-1 w-[2px] flex-1 rounded-full transition-colors",
                isCompleted ? "bg-(--color-status-success)" : "bg-(--border)"
              )}
              style={{ minHeight: 20 }}
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={!isInteractive}
          tabIndex={-1}
          className={cn(btnClass, "pt-[2px]", !isLast && "pb-6")}
        >
          {text}
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={!isInteractive}
        className={btnClass}
        aria-current={isActive ? "step" : undefined}
      >
        {circle}
        {text}
      </button>
      {!isLast && (
        // O trecho já percorrido fica verde, como o círculo cumprido.
        <div
          className={cn(
            "mx-4 h-[2px] w-[12px] shrink-0 rounded-full transition-colors",
            isCompleted ? "bg-(--color-status-success)" : "bg-(--border)"
          )}
        />
      )}
    </div>
  );
};
