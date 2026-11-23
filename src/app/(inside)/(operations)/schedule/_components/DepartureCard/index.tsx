"use client";
import { Button } from "@/components/Button";
import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { House, MapPin, Pencil } from "lucide-react";
import { useState } from "react";

import { DepartureModal } from "./DepartureModal";
import { DepartureCardProps } from "./interface";

export function DepartureCard({
  dayId,
  departureType,
  departureAddress,
  canEdit,
  onChanged,
}: DepartureCardProps) {
  const [open, setOpen] = useState(false);

  const isCustom = departureType === "CUSTOM";
  const Icon = isCustom ? MapPin : House;
  const label = isCustom ? "Endereço personalizado" : "Casa do vendedor";
  // No modo casa, o endereço resolvido (quando existe) é o próprio endereço de
  // casa; mostrá-lo confirma de onde a rota parte.
  const detail = departureAddress ?? "Definido pelo cadastro do vendedor";

  // Uma linha dentro do card do trajeto, não um cartão à parte: era um
  // terceiro bloco empilhado na coluna da rota (relato de 23/11/2026).
  return (
    <div className="flex items-center gap-10">
      <Icon
        size={16}
        className="shrink-0 text-(--color-text-muted)"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <Title variant="micro" color="muted">
          Ponto de partida
        </Title>
        <Title
          variant="body-sm"
          color="muted"
          className="block truncate"
          title={detail}
        >
          <Emphasis tone="strong">{label}</Emphasis> · {detail}
        </Title>
      </div>
      {canEdit && (
        <Button.Root
          type="button"
          appearance="ghost"
          color="neutral"
          size="sm"
          onClick={() => setOpen(true)}
          className="shrink-0"
        >
          <Button.Icon icon={Pencil} />
          <Button.Title>Alterar</Button.Title>
        </Button.Root>
      )}
      {canEdit && (
        <DepartureModal
          open={open}
          onOpenChange={setOpen}
          dayId={dayId}
          departureType={departureType}
          departureAddress={departureAddress}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
