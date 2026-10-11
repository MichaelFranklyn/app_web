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
            Os compromissos que esperam por você, do mais urgente para o que
            pode esperar. Clique na linha para ir direto aonde se resolve —
            resolveu, sai da lista sozinho.
          </PanelHeader.Description>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
