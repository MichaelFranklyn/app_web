"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { UPDATE_MY_PASSWORD_MUTATION } from "./gql";
import { UpdateMyPasswordResponse } from "./interface";
import { PASSWORD_FORM_STEPS } from "./utils";

export function PasswordCard() {
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
          formRef.current?.resetForm();
        },
      }
    );
  };

  return (
    <Card.Root className="h-auto shrink-0">
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Alterar senha
        </Card.Header.Title>
      </Card.Header>
      <Card.Body>
        <FormBuilder
          ref={formRef}
          steps={PASSWORD_FORM_STEPS}
          onSubmit={handleSubmit}
          loading={isLoading}
          unstyled
        />
        <div className="mt-16 flex justify-end">
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
        </div>
      </Card.Body>
    </Card.Root>
  );
}
