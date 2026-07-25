"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { UPDATE_USER_MUTATION } from "./gql";
import { EditUserModalProps, UpdateUserResponse } from "./interface";
import {
  ROLE_OPTIONS,
  ROLE_OPTIONS_WITH_OWNER,
  buildFormSteps,
  normalizeInput,
} from "./utils";

export function EditUserModal({
  user,
  open,
  onOpenChange,
  onUpdateOptimistic,
  onRollback,
  onCommit,
}: EditUserModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();

  const [updateUser] = useMutation<UpdateUserResponse>(UPDATE_USER_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeInput(data, user);

    if (Object.keys(normalized).length === 0) {
      onOpenChange(false);
      return;
    }

    onUpdateOptimistic(user.id, normalized);

    await execute(
      async () => {
        const res = await updateUser({
          variables: { id: user.id, input: normalized },
        });

        if (!res.data?.updateUser?.status || !res.data.updateUser.data) {
          throw new Error(
            res.data?.updateUser?.message ?? "Erro ao editar usuário"
          );
        }

        return res.data.updateUser.data;
      },
      {
        successMessage: "Usuário editado com sucesso",
        onSuccess: async () => {
          onOpenChange(false);
          formRef.current?.resetForm();
          onCommit();
          await invalidateClient(["users_list"]);
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={`Editar usuário - ${user.name}`}
          description="Preencha os dados abaixo para editar o usuário."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={buildFormSteps(user)}
            onSubmit={handleSubmit}
            unstyled
            initialData={{
              name: user.name,
              email: user.email,
              role: (user.role === "OWNER"
                ? ROLE_OPTIONS_WITH_OWNER
                : ROLE_OPTIONS
              ).find((role) => role.value === user.role),
            }}
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
            <Button.Title>Editar usuário</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
