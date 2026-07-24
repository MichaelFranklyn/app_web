import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { FormStepSchema } from "../interface";

interface StepperProps {
  steps: FormStepSchema[];
  currentStepIndex: number;
  /**
   * Centraliza a trilha de passos (padrão: alinhada à esquerda). Usa `w-max` +
   * `mx-auto` em vez de `justify-center` porque a faixa rola no horizontal:
   * com `justify-center`, uma trilha maior que a tela ficaria cortada no
   * começo e sem como voltar.
   */
  centered?: boolean;
  /** Respiro no contexto de uso (ex.: distância até o formulário no modal). */
  className?: string;
}

export const Stepper = ({
  steps,
  currentStepIndex,
  centered = false,
  className,
}: StepperProps) => {
  if (steps.length <= 1) return null;

  return (
    <div className={cn("mb-4 overflow-x-auto pb-2", className)}>
      <div
        className={cn("flex w-max items-center gap-2", centered && "mx-auto")}
      >
        {steps.map((step, idx) => (
          <div key={step.id} className="flex shrink-0 items-center gap-2">
            <div
              className={`flex h-8 min-h-[32px] w-8 min-w-[32px] flex-none items-center justify-center rounded-full text-[13px] font-bold transition-colors ${
                idx === currentStepIndex
                  ? "bg-(--amber) text-white"
                  : idx < currentStepIndex
                    ? "bg-(--green) text-white"
                    : "bg-(--bg3) text-(--muted)"
              }`}
            >
              {idx + 1}
            </div>
            <Title
              variant="caption"
              weight={idx === currentStepIndex ? "semibold" : "regular"}
              color={idx === currentStepIndex ? "default" : "muted"}
              className="whitespace-nowrap"
            >
              {step.title || `Passo ${idx + 1}`}
            </Title>
            {idx < steps.length - 1 && (
              <div className="mx-1 h-[1px] w-8 shrink-0 bg-(--border)" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
