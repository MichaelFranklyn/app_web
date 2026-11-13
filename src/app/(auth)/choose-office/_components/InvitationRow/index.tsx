"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { IconTile } from "@/components/IconTile";
import { Title } from "@/components/Title";
import { MyOffice, OFFICE_ROLE_LABEL } from "@/utils/auth/offices";
import { MailPlus } from "lucide-react";

interface InvitationRowProps {
  office: MyOffice;
  isEntering: boolean;
  onAccept: (office: MyOffice) => void;
  onDecline: (office: MyOffice) => Promise<void>;
}

/**
 * Um convite para trabalhar em outro escritório: aceitar já entra nele;
 * recusar apaga o vínculo — e por isso pergunta antes.
 */
export function InvitationRow({
  office,
  isEntering,
  onAccept,
  onDecline,
}: InvitationRowProps) {
  return (
    <Card.Root tone="highlight" inset>
      <Card.Body padding="sm" className="gap-12">
        <div className="flex items-center gap-12">
          <IconTile color="amber">
            <MailPlus />
          </IconTile>
          <div className="flex min-w-0 flex-1 flex-col">
            <Title variant="body-sm" weight="medium">
              {office.companyName}
            </Title>
            <Title variant="body-xs" color="muted">
              Convidou você como {OFFICE_ROLE_LABEL[office.role]}. Sua senha
              continua a mesma.
            </Title>
          </div>
        </div>

        <div className="flex justify-end gap-8">
          <ConfirmModal
            trigger={
              <Button.Root
                appearance="ghost"
                color="red"
                size="sm"
                noUppercase
                disabled={isEntering}
              >
                <Button.Title>Recusar</Button.Title>
              </Button.Root>
            }
            title={`Recusar o convite de ${office.companyName}?`}
            description="Você não terá acesso a este escritório. Se mudar de ideia, peça um novo convite a quem enviou."
            confirmLabel="Recusar convite"
            onConfirm={() => onDecline(office)}
            successMessage="Convite recusado."
          />
          <Button.Root
            appearance="solid"
            color="amber"
            size="sm"
            noUppercase
            loading={isEntering}
            onClick={() => onAccept(office)}
          >
            <Button.Title>Aceitar e entrar</Button.Title>
          </Button.Root>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
