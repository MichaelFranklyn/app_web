import { Stepper as StepperComponent } from "@/components/Stepper";
import { FormStepSchema } from "../interface";

interface StepperProps {
  steps: FormStepSchema[];
  currentStepIndex: number;
  /**
   * Centraliza a trilha (padrão). `false` alinha à esquerda — só para um
   * contexto em que a faixa precise acompanhar o texto ao lado.
   */
  centered?: boolean;
  /** Respiro no contexto de uso (ex.: distância até o formulário no modal). */
  className?: string;
}

/**
 * A trilha de passos do formulário de vários passos.
 *
 * O desenho é o `Stepper.Trail` — o mesmo de qualquer wizard do sistema. Aqui
 * só se traduz o esquema do formulário em rótulos: o FormBuilder já controla o
 * conteúdo do passo, então dele vem apenas a faixa.
 *
 * Centralizada como no `Stepper.Root`: a trilha fica sobre o formulário, e num
 * modal ela alinhada à esquerda puxava o olho para fora do eixo dos campos.
 */
export const Stepper = ({
  steps,
  currentStepIndex,
  centered = true,
  className,
}: StepperProps) => {
  // Um passo só não é um caminho — mostrar a trilha nesse caso é ruído.
  if (steps.length <= 1) return null;

  return (
    <StepperComponent.Trail
      steps={steps.map((step, index) => ({
        label: step.title || `Passo ${index + 1}`,
      }))}
      current={currentStepIndex}
      centered={centered}
      className={className ?? "mb-4 pb-2"}
    />
  );
};
