"use client";

import { Button } from "@/components/Button";
import { FollowUpModal } from "@/components/FollowUpModal";
import { HelpTooltip } from "@/components/HelpTooltip";
import { PanelHeader } from "@/components/PanelHeader";
import { Plus } from "lucide-react";
import { useState } from "react";

import { FOLLOW_UPS_HELP } from "../../help";

interface Props {
  onSaved: () => void;
}

export function FollowUpsHeader({ onSaved }: Props) {
  const [creating, setCreating] = useState(false);

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          {/* Eyebrow verde: contato com o cliente é assunto do módulo Clientes. */}
          <PanelHeader.Eyebrow className="text-(--green)">
            Clientes
          </PanelHeader.Eyebrow>
          <div className="flex items-center gap-6">
            <PanelHeader.Title>
              Contatos <span className="text-(--amber)">agendados</span>
            </PanelHeader.Title>
            <HelpTooltip
              label="Como funcionam os contatos agendados?"
              content={FOLLOW_UPS_HELP}
            />
          </div>
          <PanelHeader.Description>
            Com quem você combinou de falar, quando e por quê — para nenhuma
            negociação ficar esquecida.
          </PanelHeader.Description>
          <PanelHeader.Actions className="mt-6" data-tour="follow-ups-actions">
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="sm"
              noUppercase
              onClick={() => setCreating(true)}
            >
              <Button.Icon icon={Plus} />
              <Button.Title>Agendar contato</Button.Title>
            </Button.Root>
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>

      <FollowUpModal
        open={creating}
        onOpenChange={setCreating}
        onSaved={onSaved}
      />
    </PanelHeader.Root>
  );
}
