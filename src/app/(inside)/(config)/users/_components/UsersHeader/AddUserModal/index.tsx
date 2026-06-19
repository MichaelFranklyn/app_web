"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { User } from "../../../interface";
import { CREATE_USER_MUTATION } from "./gql";
import { CreateUserResponse } from "./interface";
import { FORM_STEPS, normalizeInput } from "./utils";

export function AddUserModal({
  onAddOptimistic,
}: {
  onAddOptimistic: (user: User) => void;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();

  const [createUser] = useMutation<CreateUserResponse>(CREATE_USER_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeInput(data);

    await execute(
      async () => {
        const res = await createUser({
          variables: { input: normalized },
        });

        if (!res.data?.createUser?.status || !res.data.createUser.data) {
          throw new Error(
            res.data?.createUser?.message ?? "Erro ao adicionar usuário"
          );
        }

        return res.data.createUser.data;
      },
      {
        successMessage: "Usuário adicionado com sucesso",
        onSuccess: async (newUser) => {
          setOpen(false);
          formRef.current?.resetForm();
          onAddOptimistic({ ...newUser, isActive: true });
          await invalidateClient(["users_list"]);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="md">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo Usuário</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Adicionar usuário"
          description="O usuário receberá um e-mail com link de confirmação para definir a senha."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
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
            <Button.Title>Adicionar usuário</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
