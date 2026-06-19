import React from "react";
import { Button } from "@/components/Button";

interface NavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean;
  submitLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
}

export const Navigation = ({
  isFirstStep,
  isLastStep,
  onPrev,
  onNext,
  loading,
  submitLabel = "Concluir e Enviar",
  nextLabel = "Próximo Passo",
  prevLabel = "Voltar",
}: NavigationProps) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div>
        {!isFirstStep && (
          <Button.Root
            onClick={onPrev}
            type="button"
            color="amber"
            appearance="outline"
          >
            <Button.Title>{prevLabel}</Button.Title>
          </Button.Root>
        )}
      </div>

      <div className="flex gap-4">
        {isLastStep ? (
          <Button.Root
            type="submit"
            color="amber"
            appearance="solid"
            loading={loading}
          >
            <Button.Title>{submitLabel}</Button.Title>
          </Button.Root>
        ) : (
          <Button.Root
            onClick={onNext}
            type="button"
            color="amber"
            appearance="solid"
          >
            <Button.Title>{nextLabel}</Button.Title>
          </Button.Root>
        )}
      </div>
    </div>
  );
};
