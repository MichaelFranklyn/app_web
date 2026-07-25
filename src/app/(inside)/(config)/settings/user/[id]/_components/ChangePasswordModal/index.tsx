"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { UPDATE_MY_PASSWORD_MUTATION } from "./gql";
import { UpdateMyPasswordResponse } from "./interface";
import { PASSWORD_FORM_STEPS } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({ open, onOpenChange }: Props) {
  const formRef = useRef<FormBuilderRef>(null);

  const [updatePassword] = useMutation<UpdateMyPasswordResponse>(
    UPDATE_MY_PASSWORD_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const currentPassword = String(data.currentPassword ?? "");
    const newPassword = String(data.newPassword ?? "");
    const confirmPassword = String(data.confirmPassword ?? "");

    await execute(
      async () => {
        if (newPassword.length < 8) {
          throw new Error("A nova senha precisa ter no mínimo 8 caracteres");
        }

        if (newPassword !== confirmPassword) {
          throw new Error("A confirmação não confere com a nova senha");
        }

        const res = await updatePassword({
          variables: { input: { currentPassword, newPassword } },
        });

        if (!res.data?.updateMyPassword?.status) {
          throw new Error(
            res.data?.updateMyPassword?.message ?? "Erro ao atualizar senha"
          );
        }

        return res.data.updateMyPassword;
      },
      {
        successMessage: "Senha atualizada com sucesso",
        onSuccess: () => {
          onOpenChange(false);
          formRef.current?.resetForm();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="Alterar senha"
          description="Informe a senha atual e escolha uma nova, com no mínimo 8 caracteres."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={PASSWORD_FORM_STEPS}
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
            <Button.Title>Atualizar senha</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
