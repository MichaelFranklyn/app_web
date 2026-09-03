import { cn } from "@/lib/utils";

import { Indicator } from "../Indicator";
import { StepperTrailProps } from "./interface";

/**
 * A faixa de marcos "1 ─ 2 ─ 3" — onde a pessoa está e quantos passos faltam.
 *
 * É a peça que TODO stepper do sistema desenha, e por isso mora aqui sozinha:
 * quem tem o conteúdo dos passos usa `Stepper.Root` (a trilha vem de graça);
 * quem já controla o próprio conteúdo — o `FormBuilder`, o checkout — monta só
 * a faixa a partir de uma lista de rótulos. Antes eram três desenhos parecidos
 * em três lugares, e o círculo do concluído mudava de cor conforme a tela.
 */
export function StepperTrail({
  steps,
  current,
  onChange,
  orientation = "horizontal",
  size = "md",
  centered = false,
  className,
}: StepperTrailProps) {
  if (steps.length === 0) return null;

  const isVertical = orientation === "vertical";

  return (
    // `shrink-0`: dentro de uma coluna flex com altura limitada — o corpo de um
    // modal, por exemplo —, os itens encolhem para caber. A faixa, que é baixa
    // e tem `overflow` próprio, era achatada até a altura ZERO: os marcos
    // continuavam no DOM, pintados e com tamanho certo, e o que aparecia na
    // tela era um espaço em branco.
    <div
      className={cn("shrink-0", !isVertical && "overflow-x-auto", className)}
    >
      <div
        className={cn(
          isVertical
            ? "flex flex-col"
            : ["flex w-max items-center", centered && "mx-auto"]
        )}
      >
        {steps.map((step, index) => (
          <Indicator
            key={`${index}-${step.label}`}
            index={index}
            total={steps.length}
            current={current}
            size={size}
            orientation={orientation}
            label={step.label}
            description={step.description}
            disabled={step.disabled}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

StepperTrail.displayName = "Stepper.Trail";
