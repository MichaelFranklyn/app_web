"use client";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Target } from "lucide-react";

import { SetGoalModalProps } from "./interface";
import { useSetGoal } from "./useSetGoal";

/**
 * Define ou ajusta a meta de um vendedor numa fábrica, no mês aberto na tela.
 * Um caminho só para os dois casos: a grade de metas é preenchida aos poucos e
 * reajustada durante o mês, então "já existe" não é erro.
 */
export function SetGoalModal(props: SetGoalModalProps) {
  const {
    open,
    handleClose,
    formRef,
    steps,
    initialData,
    handleSubmit,
    isLoading,
    isEditing,
  } = useSetGoal(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        {props.trigger ?? (
          <Button.Root appearance="solid" color="amber" size="sm" noUppercase>
            <Button.Icon icon={Target} />
            <Button.Title>Definir meta</Button.Title>
          </Button.Root>
        )}
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title={isEditing ? "Ajustar meta do mês" : "Definir meta do mês"}
          description="Preencha só o que você acompanha. Campo em branco quer dizer que aquele número não é cobrado neste mês."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>

        <Modal.Footer>
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
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Salvar meta</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
