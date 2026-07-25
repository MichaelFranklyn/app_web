"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { ProfileSeller } from "../interface";
import { UPDATE_SELLER_MUTATION } from "./gql";
import { UpdateSellerResponse } from "./interface";
import {
  buildSellerInitialData,
  normalizeSellerInput,
  SELLER_FORM_STEPS,
} from "./utils";

interface Props {
  seller: ProfileSeller;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

export function EditSellerDataModal({
  seller,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateSeller] = useMutation<UpdateSellerResponse>(
    UPDATE_SELLER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const res = await updateSeller({
          variables: { id: seller.id, input: normalizeSellerInput(data) },
        });
        if (!res.data?.updateSeller?.status) {
          throw new Error(
            res.data?.updateSeller?.message ?? "Erro ao atualizar"
          );
        }
        return res.data.updateSeller;
      },
      {
        successMessage: "Atuação em campo atualizada",
        onSuccess: () => {
          onOpenChange(false);
          formRef.current?.resetForm();
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Editar atuação em campo"
          description="A região atendida. Os dados pessoais se editam no card “Dados pessoais”."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={SELLER_FORM_STEPS}
            onSubmit={handleSubmit}
            initialData={buildSellerInitialData(seller)}
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
            <Button.Title>Salvar alterações</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
