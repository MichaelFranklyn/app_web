"use client";

import { PanelHeader } from "@/components/PanelHeader";

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
          <PanelHeader.Title>Redes de clientes</PanelHeader.Title>
          <PanelHeader.Description>
            Lojas do mesmo grupo reunidas numa rede — assim você vê quanto o
            grupo inteiro comprou, sem somar loja por loja.
          </PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
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
