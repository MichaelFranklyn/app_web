"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ShareLinkBox } from "@/components/ShareLinkBox";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useUserRole } from "@/services/flowTour/useUserRole";
import { formatDate } from "@/utils/format/date";
import { Link2 } from "lucide-react";
import { useState } from "react";
import {
  IssuedResponseLink,
  ResponseLinkScope,
  useIssueResponseLink,
} from "../../_shared/responseLink";
import { EmailLinkButton } from "./EmailLinkButton";

interface Props {
  /** Dia ou semana da rotina — o link responde o recorte, não o vendedor. */
  scope: ResponseLinkScope;
  /**
   * O recorte por extenso, para a mensagem do WhatsApp dizer do que se trata
   * ("terça, 22/09" ou "semana de 21/09 a 27/09").
   */
  dateLabel: string;
  isEmpty: boolean;
  /**
   * Aberto pelo pai (item de um menu "Mais ações"): sem botão próprio. Sem
   * estas props o modal traz o seu gatilho, como antes.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Quem abre é o próprio vendedor ou o gestor: o texto fala com quem lê —
// "mandar ao vendedor" para o próprio vendedor não fazia sentido.
const AUDIENCE = {
  manager: {
    description:
      "O vendedor abre no celular, marca como foi cada visita e o sistema atualiza a rotina sozinho.",
    issue: "Ao gerar, você recebe um endereço para mandar ao vendedor.",
  },
  self: {
    description:
      "Abra no celular, marque como foi cada visita e o sistema atualiza a rotina sozinho.",
    issue: "Ao gerar, você recebe um endereço para abrir no celular.",
  },
} as const;

const COPY = {
  day: {
    hint: "Gera o link para o vendedor contar pelo celular como foram as visitas do dia.",
    title: "Link de resposta do dia",
    scopeText: "Ele serve só para este dia e vale por 7 dias.",
    printed: "rota impressa",
  },
  week: {
    hint: "Gera o link para o vendedor contar pelo celular como foram as visitas da semana.",
    title: "Link de resposta da semana",
    scopeText:
      "Ele serve para esta semana inteira: cada dia aparece no formulário quando chega, e o link vale até 7 dias depois do fim da semana.",
    printed: "rotina da semana impressa",
  },
} as const;

/**
 * O link da folha de resposta sem precisar imprimir: o vendedor abre no
 * celular e conta como foi o dia (ou a semana), e as visitas se atualizam
 * sozinhas. Compartilhado pela rota do dia e pela rotina da semana.
 *
 * É o MESMO link do QR da folha impressa — e cada emissão derruba a anterior.
 * Por isso o modal avisa ANTES de gerar: quem já está com a folha na mão
 * perderia o QR sem saber.
 */
export function ResponseLinkModal({
  scope,
  dateLabel,
  isEmpty,
  open,
  onOpenChange,
}: Props) {
  const [ownOpen, setOwnOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : ownOpen;
  const audience = AUDIENCE[useUserRole() === "SELLER" ? "self" : "manager"];
  const [issued, setIssued] = useState<IssuedResponseLink | null>(null);
  const { execute, isLoading } = useAsyncAction();
  const issueLink = useIssueResponseLink(scope);
  const copy = COPY[scope.kind];

  // A URL só existe na memória da aba: fechar o modal a esquece, para ninguém
  // achar que dá para voltar e copiar de novo mais tarde.
  const handleOpenChange = (open: boolean) => {
    if (isControlled) onOpenChange?.(open);
    else setOwnOpen(open);
    if (!open) setIssued(null);
  };

  const handleIssue = async () => {
    await execute(issueLink, {
      successMessage: "Link gerado",
      onSuccess: setIssued,
    });
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <Modal.Trigger asChild>
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            disabled={isEmpty}
            title={copy.hint}
          >
            <Button.Icon icon={Link2} />
            <Button.Title>Link de resposta</Button.Title>
          </Button.Root>
        </Modal.Trigger>
      )}

      <Modal.Content size="lg">
        <Modal.Header title={copy.title} description={audience.description} />

        <Modal.Body>
          {issued ? (
            <div className="flex flex-col gap-12">
              <ShareLinkBox
                url={issued.url}
                label="Link de resposta"
                whatsappMessage={`Olá! Conte aqui como foram as visitas de ${dateLabel}:`}
              />
              <div>
                <EmailLinkButton url={issued.url} />
              </div>
              <Title variant="body-xs" color="muted">
                Vale até {formatDate(issued.expiresAt)}.
              </Title>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              <Title variant="body-sm">
                {audience.issue} {copy.scopeText}
              </Title>
              <Alert.Root variant="warning">
                <Alert.Description>
                  É o mesmo link do QR da {copy.printed}. Gerar um novo faz o QR
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
