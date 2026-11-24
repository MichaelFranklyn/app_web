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
  // Só se volta a um passo cumprido: o futuro depende do que o passo atual
  // ainda tem de fazer (escolher o arquivo, casar os produtos) — pular pela
  // faixa levava a um passo vazio ou com dado velho. Avançar é o botão do passo.
  const isInteractive = !!onChange && !disabled && isCompleted;

  const handleClick = () => {
    if (isInteractive) onChange!(index);
  };

  const circle = (
    <div className={getCircleClasses(size, isCompleted, isActive, isPending)}>
      {isCompleted ? <Check size={iconSize[size]} /> : index + 1}
    </div>
  );

  const text = (
    // Na faixa horizontal do celular, só o passo atual mostra o nome: com
    // quatro nomes a faixa passava da tela e o último saía cortado ("Qu…").
    // Os outros ficam só o número — o nome continua para leitor de tela — e o
    // "Passo X de N" do Stepper.Intro logo abaixo dá o contexto (crítica de
    // configurações, 23/11/2026).
    <div
      className={cn(
        "flex flex-col",
        orientation === "horizontal" && !isActive && "max-tablet:sr-only"
      )}
    >
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
