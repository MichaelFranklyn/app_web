"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { UserDetail } from "../interface";
import {
  buildPersonFormSteps,
  buildPersonInitialData,
  normalizePersonData,
  PersonDataInput,
} from "../personDataForm";

interface Props {
  profile: UserDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Próprio cadastro: muda a cópia do formulário e do cabeçalho. */
  isSelf?: boolean;
  description: string;
  isLoading: boolean;
  /** Recebe só o que mudou; quem grava (e com qual mutation) é quem monta este modal. */
  onSubmit: (input: PersonDataInput) => Promise<void>;
}

/**
 * Edição dos dados da pessoa em DOIS PASSOS: identificação e endereço. São 12
 * campos — num único bloco a pessoa rola, perde o fio e não sabe quanto falta;
 * em passos ela vê "1 de 2" e termina um assunto antes de começar o outro.
 *
 * O FormBuilder fica `unstyled` (sem stepper nem navegação próprios) e a troca de
 * passo é feita daqui pelo ref: `nextStep()` valida o passo atual antes de
 * avançar, então ninguém passa por cima de um campo obrigatório.
 */
export function PersonDataModal({
  profile,
  open,
  onOpenChange,
  isSelf,
  description,
  isLoading,
  onSubmit,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [step, setStep] = useState(0);
  // A contagem vem do próprio formulário: acrescentar um passo lá não exige
  // lembrar de mexer aqui.
  const steps = buildPersonFormSteps(!!isSelf);
  const isLastStep = step === steps.length - 1;

  const handleOpenChange = (next: boolean) => {
    // Reabrir depois de fechar no meio começa do primeiro passo.
    if (!next) setStep(0);
    onOpenChange(next);
  };

  const goNext = async () => {
    const moved = await formRef.current?.nextStep();
    if (moved) setStep((prev) => prev + 1);
  };

  const goBack = () => {
    formRef.current?.prevStep();
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizePersonData(data, profile);

    // Nada mudou: fechar sem ir ao servidor é mais honesto que um "salvo".
    if (Object.keys(normalized).length === 0) {
      handleOpenChange(false);
      return;
    }

    await onSubmit(normalized);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content size="md">
        <Modal.Header title="Editar dados pessoais" description={description} />

        <Modal.Body>
          <div className="flex flex-col gap-16">
            <Title variant="micro" color="muted" className="uppercase">
              Passo {step + 1} de {steps.length}
            </Title>

            <FormBuilder
              ref={formRef}
              steps={steps}
              onSubmit={handleSubmit}
              loading={isLoading}
              initialData={buildPersonInitialData(profile)}
              unstyled
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          {step === 0 ? (
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading}
              >
                <Button.Title>Cancelar</Button.Title>
              </Button.Root>
            </Modal.Close>
          ) : (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={goBack}
            >
              <Button.Icon icon={ArrowLeft} />
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          )}

          {isLastStep ? (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              loading={isLoading}
              onClick={() => formRef.current?.submitForm()}
            >
              <Button.Title>Salvar alterações</Button.Title>
            </Button.Root>
          ) : (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              onClick={goNext}
            >
              <Button.Title>Continuar</Button.Title>
              <Button.Icon icon={ArrowRight} />
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
