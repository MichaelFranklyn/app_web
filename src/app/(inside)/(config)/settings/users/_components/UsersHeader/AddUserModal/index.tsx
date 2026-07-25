"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
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
  // Vendedor recém-criado: o perfil de campo nasce vazio (sem CPF nem endereço
  // de partida) e a rota do dia não calcula até alguém completar.
  const [pendingSeller, setPendingSeller] = useState<string | null>(null);
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
          // A mutation devolve só a identidade; telefone e perfil de campo se
          // preenchem depois, no perfil da pessoa.
          onAddOptimistic({
            ...newUser,
            isActive: true,
            phone: null,
            seller: null,
          });
          await invalidateClient(["users_list"]);
          if (normalized.role.toUpperCase() === "SELLER") {
            setPendingSeller(newUser.id);
          }
        },
      }
    );
  };

  return (
    <>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Trigger asChild>
          <Button.Root appearance="solid" color="amber" size="sm">
            <Button.Icon icon={Plus} />
            <Button.Title>Nova Pessoa</Button.Title>
          </Button.Root>
        </Modal.Trigger>

        <Modal.Content size="md">
          <Modal.Header
            title="Adicionar pessoa"
            description="Ela receberá um e-mail com link de confirmação para definir a senha. Com o perfil Vendedor, já nasce podendo operar em campo."
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
              <Button.Title>Adicionar pessoa</Button.Title>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Sem CPF e endereço de partida a rota do dia não é calculada — melhor
        levar a pessoa para completar agora do que descobrir isso depois. */}
      <ConfirmModal
        open={!!pendingSeller}
        onOpenChange={(next) => !next && setPendingSeller(null)}
        title="Complete os dados de vendedor"
        description="Falta o CPF, a região e o endereço de partida das visitas. Sem eles o sistema não monta a rota do dia dessa pessoa."
        confirmLabel="Completar agora"
        cancelLabel="Depois"
        confirmColor="amber"
        redirectTo={
          pendingSeller ? `/settings/users/${pendingSeller}` : undefined
        }
        onConfirm={async () => {}}
      />
    </>
  );
}
