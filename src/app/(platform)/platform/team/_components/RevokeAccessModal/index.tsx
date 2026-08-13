"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { ChangeEvent, useState } from "react";
import { SET_PLATFORM_USER_STATUS_MUTATION } from "../../gql";
import { PlatformStaffMember } from "../../interface";

interface Props {
  /** Nulo fecha a janela — quem abre escolhe a pessoa. */
  member: PlatformStaffMember | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

interface StatusData {
  setPlatformUserStatus: { status: boolean; message: string; data: unknown };
}

/**
 * Revoga (ou devolve) o acesso de alguém da equipe.
 *
 * Confirmação em janela, como toda ação destrutiva do sistema: revogar tira a
 * pessoa de TODAS as empresas no próximo request, e um clique errado na tabela
 * derrubaria alguém no meio de um atendimento.
 *
 * Pede motivo por escrito na revogação: a trilha é permanente e é ela que
 * responde, meses depois, por que aquela conta parou.
 */
export function RevokeAccessModal({ member, onOpenChange, onDone }: Props) {
  const [reason, setReason] = useState("");
  const [mutate] = useMutation<StatusData>(SET_PLATFORM_USER_STATUS_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const isRevoking = member?.isActive ?? true;

  const handleConfirm = async () => {
    if (!member) return;
    await execute(
      async () => {
        const { data } = await mutate({
          variables: {
            userId: member.id,
            input: { isActive: !isRevoking, reason: reason.trim() || null },
          },
        });
        const response = data?.setPlatformUserStatus;
        if (!response?.status)
          throw new Error(response?.message ?? "Falha na operação.");
        return response.data;
      },
      {
        successMessage: isRevoking ? "Acesso revogado." : "Acesso devolvido.",
        onSuccess() {
          setReason("");
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={!!member} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={isRevoking ? "Revogar acesso" : "Devolver acesso"}
          description={member ? `${member.name} (${member.email})` : undefined}
        />

        <Modal.Body className="flex flex-col gap-12">
          <Title variant="body-sm" color="muted">
            {isRevoking ? (
              <>
                A conta deixa de entrar no sistema imediatamente — não no
                próximo login. Ela <strong>não é apagada</strong>: continua
                nesta lista como revogada, para a trilha de auditoria seguir
                apontando para um nome.
              </>
            ) : (
              <>
                A conta volta a acessar o console e todas as empresas. Se a
                pessoa não lembra a senha, gere um link de acesso depois.
              </>
            )}
          </Title>

          <Input.Text
            label="Motivo"
            hint="Fica registrado na auditoria permanente da plataforma."
            value={reason}
            placeholder={
              isRevoking
                ? "Ex.: saiu da equipe em 13/08"
                : "Ex.: retorno de férias"
            }
            maxLength={255}
            disabled={isLoading}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setReason(e.target.value)
            }
          />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root type="button" appearance="ghost" disabled={isLoading}>
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            appearance="solid"
            color={isRevoking ? "red" : "amber"}
            onClick={handleConfirm}
            loading={isLoading}
          >
            <Button.Title>
              {isRevoking ? "Revogar acesso" : "Devolver acesso"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
