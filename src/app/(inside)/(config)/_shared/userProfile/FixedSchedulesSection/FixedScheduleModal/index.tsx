"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { CalendarPlus, Pencil, TriangleAlert } from "lucide-react";

import {
  FixedScheduleFormProps,
  useFixedScheduleForm,
} from "./useFixedScheduleForm";

/**
 * Marca (ou ajusta) o dia fixo de um cliente.
 *
 * O mesmo modal serve para os dois: só o que muda é o cliente estar escolhido
 * ou não. Separar em dois arquivos duplicaria seis campos idênticos para trocar
 * um título.
 *
 * O ponto delicado é a RECUSA. O backend não aceita um compromisso que não cabe
 * — dia cheio de fixos, clientes em pontas opostas da região, jornada
 * estourada — e recusa com o motivo escrito. Esse texto fica dentro do modal,
 * num alerta, porque ele não é um aviso: é uma decisão a tomar ali mesmo
 * ("escolha outro dia da semana"), e o gestor precisa relê-lo enquanto mexe nos
 * campos.
 */
export function FixedScheduleModal(props: FixedScheduleFormProps) {
  const {
    open,
    handleClose,
    formRef,
    steps,
    initialData,
    handleSubmit,
    isLoading,
    isEditing,
    refusal,
    hasClients,
  } = useFixedScheduleForm(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        {isEditing ? (
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            isIconOnly
            label="Ajustar dia fixo"
          >
            <Button.Icon icon={Pencil} />
          </Button.Root>
        ) : (
          <Button.Root appearance="solid" color="amber" size="sm">
            <Button.Icon icon={CalendarPlus} />
            <Button.Title>Marcar dia fixo</Button.Title>
          </Button.Root>
        )}
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title={isEditing ? "Ajustar dia fixo" : "Marcar dia fixo"}
          description="O vendedor passa neste cliente sempre no mesmo dia da semana, independentemente do que a rotina sugerir."
        />

        <Modal.Body>
          <div className="flex flex-col gap-16">
            {refusal && (
              <Alert.Root variant="error">
                <Alert.Icon icon={TriangleAlert} />
                <Alert.Content>
                  <Alert.Title>Este dia não comporta o compromisso</Alert.Title>
                  <Alert.Description>{refusal}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            {!hasClients && (
              <Alert.Root variant="warning">
                <Alert.Icon icon={TriangleAlert} />
                <Alert.Content>
                  <Alert.Title>Nenhum cliente disponível</Alert.Title>
                  <Alert.Description>
                    Todos os clientes da carteira já têm dia marcado, ou o
                    vendedor ainda não tem clientes vinculados.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            <FormBuilder
              ref={formRef}
              steps={steps}
              initialData={initialData}
              onSubmit={handleSubmit}
              loading={isLoading}
              unstyled
            />
          </div>
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
            disabled={!hasClients}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>{isEditing ? "Salvar" : "Marcar dia"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
