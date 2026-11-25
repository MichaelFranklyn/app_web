"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { RESEND_WELCOME_EMAIL_MUTATION } from "./gql";

interface ResendWelcomeResponse {
  resendWelcomeEmail: { status: boolean; message: string };
}

interface ResendWelcomeModalProps {
  id: string;
  userName: string;
  email: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/**
 * Reenvia o email de primeiros passos (link para criar a senha). Confirma
 * antes porque o link anterior deixa de valer — quem já tinha recebido precisa
 * usar o novo.
 */
export function ResendWelcomeModal({
  id,
  userName,
  email,
  open,
  onOpenChange,
}: ResendWelcomeModalProps) {
  const [resend] = useMutation<ResendWelcomeResponse>(
    RESEND_WELCOME_EMAIL_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = () =>
    execute(
      async () => {
        const res = await resend({ variables: { id } });
        const data = res.data?.resendWelcomeEmail;
        if (!data?.status) {
          throw new Error(data?.message ?? "Erro ao reenviar o email");
        }
        return data;
      },
      {
        successMessage: (data) => data.message,
        onSuccess: () => onOpenChange(false),
      }
    );

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="Reenviar email de primeiros passos"
          description={`${userName} vai receber em ${email} um novo link para criar a senha e entrar. O link enviado antes deixa de valer.`}
        />

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
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
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Reenviar email</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
