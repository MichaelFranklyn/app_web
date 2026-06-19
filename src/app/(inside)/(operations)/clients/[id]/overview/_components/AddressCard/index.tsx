"use client";

import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { MapPin } from "lucide-react";
import { AddressCardProps } from "./interface";
import { EditAddressModal } from "./_components/EditAddressModal";

export function AddressCard({
  clientId,
  address,
  currentAddress,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: AddressCardProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title
          size="sm"
          weight="semibold"
          className="inline-flex items-center gap-6"
        >
          Endereço
          <HelpTooltip
            label="Sobre o endereço"
            content="Endereço cadastral do cliente, usado para localização e dados de entrega. Edite para corrigir."
          />
        </Card.Header.Title>
        <Card.Header.Actions>
          <EditAddressModal
            clientId={clientId}
            currentAddress={currentAddress}
            onUpdateOptimistic={onUpdateOptimistic}
            onCommit={onCommit}
            onRollback={onRollback}
          />
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        <Title variant="body-sm" color="secondary" className="mb-12">
          {address}
        </Title>
        <div className="flex h-50 flex-col items-center justify-center gap-8 rounded-(--r-lg) border border-(--border) bg-(--bg3) text-(--muted2)">
          <MapPin size={24} strokeWidth={1.5} />
          <Title variant="body-xs" color="muted2">
            Mapa Google Maps
          </Title>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
