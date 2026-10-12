"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { PanelHeader } from "@/components/PanelHeader";

import { PENDING_HELP } from "../../help";

export function PendingHeader() {
  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <div className="flex items-center gap-6">
            <PanelHeader.Title>
              Pendências <span className="text-(--amber)">do dia</span>
            </PanelHeader.Title>
            <HelpTooltip
              label="O que entra nas pendências?"
              content={PENDING_HELP}
            />
          </div>
          <PanelHeader.Description>
            Os compromissos que esperam por você, um cartão por assunto, com os
            mais urgentes à vista. Abra a lista do assunto para ir direto aonde
            cada um se resolve — resolveu, sai daqui sozinho.
          </PanelHeader.Description>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
