"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

import { NETWORK_HELP } from "../../../help";
import { ClientNetwork } from "../../interface";
import { AddNetworkModal } from "./AddNetworkModal";

interface Props {
  onAddOptimistic: (network: ClientNetwork) => void;
  onChanged: () => void;
}

export function NetworksHeader({ onAddOptimistic, onChanged }: Props) {
  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <div className="flex items-center gap-6">
            <PanelHeader.Heading {...PAGE_HEADING.networks}>
              Redes de clientes
            </PanelHeader.Heading>
            <HelpTooltip label="O que é uma rede?" content={NETWORK_HELP} />
          </div>
          <PanelHeader.Description>
            Lojas do mesmo grupo reunidas numa rede — assim você vê quanto o
            grupo inteiro comprou, sem somar loja por loja.
          </PanelHeader.Description>
          <PanelHeader.Actions>
            <AddNetworkModal
              onAddOptimistic={onAddOptimistic}
              onChanged={onChanged}
            />
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
