import { Title } from "@/components/Title";
import { FormStepSchema } from "../interface";

interface StepperProps {
  steps: FormStepSchema[];
  currentStepIndex: number;
}

export const Stepper = ({ steps, currentStepIndex }: StepperProps) => {
  if (steps.length <= 1) return null;

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex shrink-0 items-center gap-2">
          <div
            className={`flex h-8 min-h-[32px] w-8 min-w-[32px] flex-none items-center justify-center rounded-full text-xs font-bold transition-colors ${
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
  );
};
