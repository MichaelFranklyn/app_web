"use client";

import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { PanelHeader } from "@/components/PanelHeader";
import { SupportCaseModal } from "@/components/SupportCaseModal";
import { Plus } from "lucide-react";
import { useState } from "react";

import { SUPPORT_HELP } from "../../help";

interface Props {
  onSaved: () => void;
}

export function SupportHeader({ onSaved }: Props) {
  const [creating, setCreating] = useState(false);

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          {/* Eyebrow verde: atendimento é assunto do módulo Clientes. */}
          <PanelHeader.Eyebrow className="text-(--green)">
            Clientes
          </PanelHeader.Eyebrow>
          <div className="flex items-center gap-6">
            <PanelHeader.Title>
              Atendimentos <span className="text-(--amber)">do cliente</span>
            </PanelHeader.Title>
            <HelpTooltip
              label="O que entra nos atendimentos?"
              content={SUPPORT_HELP}
            />
          </div>
          <PanelHeader.Description>
            Os problemas que os clientes relatam e o que já foi feito sobre cada
            um — mercadoria, pagamento, entrega.
          </PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="sm"
              noUppercase
              onClick={() => setCreating(true)}
            >
              <Button.Icon icon={Plus} />
              <Button.Title>Registrar atendimento</Button.Title>
            </Button.Root>
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>

      <SupportCaseModal
        open={creating}
        onOpenChange={setCreating}
        onSaved={onSaved}
      />
    </PanelHeader.Root>
  );
}
