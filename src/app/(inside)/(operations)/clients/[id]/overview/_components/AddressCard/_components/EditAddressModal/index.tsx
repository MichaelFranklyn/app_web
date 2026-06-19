"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { UpdateAddressResponse } from "../../../../interface";
import { UPDATE_ADDRESS_MUTATION } from "./gql";
import { EditAddressModalProps } from "./interface";
import {
  buildAddressFormSteps,
  buildAddressInitialData,
  normalizeAddressInput,
} from "./utils";

export function EditAddressModal({
  clientId,
  currentAddress,
  onSuccess,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: EditAddressModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();

  const [updateAddress] = useMutation<UpdateAddressResponse>(
    UPDATE_ADDRESS_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeAddressInput(data);

    setOpen(false);
    onUpdateOptimistic(normalized);

    await execute(
      async () => {
        const res = await updateAddress({
          variables: { id: clientId, input: normalized },
        });

        if (!res.data?.updateClientAddress?.status) {
          throw new Error(
            res.data?.updateClientAddress?.message ??
              "Erro ao atualizar endereço"
          );
        }

        return res.data.updateClientAddress.data;
      },
      {
        successMessage: "Endereço atualizado com sucesso",
        onSuccess: () => {
          formRef.current?.resetForm();
          onCommit();
          onSuccess?.();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  const formSteps = buildAddressFormSteps();

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="xs" noUppercase>
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar Endereço"
          description="Atualize os dados de localização do cliente"
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={buildAddressInitialData(currentAddress)}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
