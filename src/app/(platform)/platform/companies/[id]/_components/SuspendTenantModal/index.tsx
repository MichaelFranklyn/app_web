"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { SET_TENANT_STATUS_MUTATION } from "../../gql";
import { SetTenantStatusData } from "../../interface";
import { reasonOf, SUSPEND_STEPS } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  /** Suspender exige motivo; reativar não pede nada. */
  isSuspending: boolean;
  onDone: () => void;
}

/**
 * Suspender/reativar a empresa inteira.
 *
 * Não usa o `ConfirmModal` genérico porque a suspensão precisa de um campo: o
 * backend recusa sem motivo, e é esse texto que a trilha mostra meses depois,
 * quando alguém for entender por que a conta parou.
 */
export function SuspendTenantModal({
  open,
  onOpenChange,
  companyId,
  companyName,
  isSuspending,
  onDone,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [mutate] = useMutation<SetTenantStatusData>(SET_TENANT_STATUS_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async (formData: Record<string, unknown>) => {
    await execute(
      async () => {
        const { data } = await mutate({
          variables: {
            companyId,
            input: { isActive: !isSuspending, reason: reasonOf(formData) },
          },
        });
        const response = data?.setTenantStatus;
        if (!response?.status)
          throw new Error(response?.message ?? "Falha na operação.");
        return response.data;
      },
      {
        successMessage: isSuspending
          ? "Empresa suspensa."
          : "Empresa reativada.",
        onSuccess() {
          formRef.current?.resetForm();
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={isSuspending ? "Suspender empresa" : "Reativar empresa"}
          description={
            isSuspending
              ? `Ninguém de ${companyName} vai conseguir entrar, e quem estiver logado é desconectado em até 30 segundos. Os dados não são apagados — a conta volta ao normal ao reativar.`
              : `O acesso de ${companyName} é liberado imediatamente.`
          }
        />

        <Modal.Body>
          {isSuspending ? (
            <FormBuilder
              ref={formRef}
              steps={SUSPEND_STEPS}
              onSubmit={handleConfirm}
              loading={isLoading}
              unstyled
            />
          ) : (
            <Title variant="body-sm" color="muted">
              A empresa volta a operar com todos os dados como estavam.
            </Title>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button.Root
            appearance="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <Button.Title>Cancelar</Button.Title>
          </Button.Root>
          <Button.Root
            type="button"
            appearance="solid"
            color={isSuspending ? "red" : "amber"}
            // Suspender passa pelo formulário (é ele que cobra o motivo antes de
            // ir à rede); reativar não tem campo nenhum e confirma direto.
            onClick={() =>
              isSuspending ? formRef.current?.submitForm() : handleConfirm({})
            }
            loading={isLoading}
          >
            <Button.Title>
              {isSuspending ? "Suspender" : "Reativar"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
