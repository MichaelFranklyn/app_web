"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ShareLinkBox } from "@/components/ShareLinkBox";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { Link2 } from "lucide-react";
import { useState } from "react";
import { ISSUE_VISIT_RESPONSE_LINK_MUTATION } from "../../gql";
import { IssueVisitResponseLinkResponse } from "../../interface";

interface Props {
  /** Dia da rotina — o link responde este dia, não o vendedor. */
  scheduleDayId: string;
  /** Data por extenso, para a mensagem do WhatsApp dizer de que dia se trata. */
  dateLabel: string;
  isEmpty: boolean;
}

/**
 * O link da folha de resposta sem precisar imprimir: o vendedor abre no
 * celular e conta como foi o dia, e as visitas se atualizam sozinhas.
 *
 * É o MESMO link do QR da folha impressa — e cada emissão derruba a anterior.
 * Por isso o modal avisa ANTES de gerar: quem já está com a folha na mão
 * perderia o QR sem saber.
 */
export function ResponseLinkModal({
  scheduleDayId,
  dateLabel,
  isEmpty,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [issued, setIssued] = useState<{
    url: string;
    expiresAt: string;
  } | null>(null);
  const { execute, isLoading } = useAsyncAction();
  const [issueLink] = useMutation<IssueVisitResponseLinkResponse>(
    ISSUE_VISIT_RESPONSE_LINK_MUTATION
  );

  // A URL só existe na memória da aba: fechar o modal a esquece, para ninguém
  // achar que dá para voltar e copiar de novo mais tarde.
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setIssued(null);
  };

  const handleIssue = async () => {
    await execute(
      async () => {
        const res = await issueLink({ variables: { scheduleDayId } });
        const payload = res.data?.issueVisitResponseLink;
        if (!payload?.status || !payload.data?.url) {
          throw new Error(payload?.message ?? "Erro ao gerar o link");
        }
        return payload.data;
      },
      { successMessage: "Link gerado", onSuccess: setIssued }
    );
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          disabled={isEmpty}
          title="Gera o link para o vendedor contar pelo celular como foram as visitas do dia."
        >
          <Button.Icon icon={Link2} />
          <Button.Title>Link de resposta</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="lg">
        <Modal.Header
          title="Link de resposta do dia"
          description="O vendedor abre no celular, marca como foi cada visita e o sistema atualiza a rotina sozinho."
        />

        <Modal.Body>
          {issued ? (
            <div className="flex flex-col gap-12">
              <ShareLinkBox
                url={issued.url}
                label="Link de resposta"
                whatsappMessage={`Olá! Conte aqui como foram as visitas de ${dateLabel}:`}
              />
              <Title variant="body-xs" color="muted">
                Vale até {formatDate(issued.expiresAt)}.
              </Title>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              <Title variant="body-sm">
                Ao gerar, você recebe um endereço para mandar ao vendedor. Ele
                serve só para este dia e vale por 7 dias.
              </Title>
              <Alert.Root variant="warning">
                <Alert.Description>
                  É o mesmo link do QR da rota impressa. Gerar um novo faz o QR
                  de uma folha já impressa parar de funcionar.
                </Alert.Description>
              </Alert.Root>
            </div>
          )}
        </Modal.Body>

        {!issued && (
          <Modal.Footer>
            <Button.Root
              appearance="solid"
              color="amber"
              size="sm"
              noUppercase
              loading={isLoading}
              onClick={() => void handleIssue()}
            >
              <Button.Title>Gerar link</Button.Title>
            </Button.Root>
          </Modal.Footer>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
