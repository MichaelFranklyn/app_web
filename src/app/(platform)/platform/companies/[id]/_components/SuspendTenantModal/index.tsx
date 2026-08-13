"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { ChangeEvent, useState } from "react";
import { SET_TENANT_STATUS_MUTATION } from "../../gql";
import { SetTenantStatusData } from "../../interface";

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
  const [reason, setReason] = useState("");
  const [mutate] = useMutation<SetTenantStatusData>(SET_TENANT_STATUS_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const { data } = await mutate({
          variables: {
            companyId,
            input: { isActive: !isSuspending, reason: reason.trim() || null },
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
          setReason("");
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
            <Input.Text
              label="Motivo"
              hint="Fica registrado na auditoria — é o que explica a suspensão depois."
              value={reason}
              placeholder="Ex.: inadimplência desde 07/2026"
              maxLength={255}
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setReason(e.target.value)
              }
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
            appearance="solid"
            color={isSuspending ? "red" : "amber"}
            onClick={handleConfirm}
            loading={isLoading}
            // O backend recusaria de qualquer forma; barrar aqui evita a ida à
            // rede só para receber "informe o motivo".
            disabled={isSuspending && !reason.trim()}
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
