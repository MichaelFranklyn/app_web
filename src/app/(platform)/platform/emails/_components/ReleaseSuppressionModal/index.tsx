"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { RELEASE_EMAIL_SUPPRESSION_MUTATION } from "../../gql";
import { RELEASE_STEPS, reasonOf } from "./utils";

interface ReleaseData {
  releaseEmailSuppression: { status: boolean; message: string; data: unknown };
}

/**
 * Tira o endereço da lista de bloqueio, com motivo para a auditoria.
 *
 * Confirmação em janela porque liberar um endereço que a Brevo deu como
 * inexistente — ou que marcou spam — e voltar a mandar para ele é o que mais
 * derruba a reputação do domínio. Quem libera precisa ter um porquê.
 */
export function ReleaseSuppressionModal({
  email,
  onOpenChange,
  onDone,
}: {
  /** Nulo fecha a janela. */
  email: string | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const formRef = useRef<FormBuilderRef>(null);
  const [mutate] = useMutation<ReleaseData>(RELEASE_EMAIL_SUPPRESSION_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async (formData: Record<string, unknown>) => {
    if (!email) return;
    await execute(
      async () => {
        const { data } = await mutate({
          variables: { email, reason: reasonOf(formData) },
        });
        const response = data?.releaseEmailSuppression;
        if (!response?.status)
          throw new Error(response?.message ?? "Falha na operação.");
        return response.data;
      },
      {
        successMessage: "Endereço liberado: volta a receber emails.",
        onSuccess() {
          formRef.current?.resetForm();
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={!!email} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Liberar endereço"
          description={email ?? undefined}
        />

        <Modal.Body className="flex flex-col gap-12">
          <Title variant="body-sm" color="muted">
            O próximo email para este endereço volta a sair. Se o problema
            continuar (caixa inexistente, spam), a Brevo bloqueia de novo no
            primeiro envio.
          </Title>

          <FormBuilder
            ref={formRef}
            steps={RELEASE_STEPS}
            onSubmit={handleConfirm}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root type="button" appearance="ghost" disabled={isLoading}>
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            onClick={() => formRef.current?.submitForm()}
            loading={isLoading}
          >
            <Button.Title>Liberar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
