"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
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

  return (
    <Card.Root>
      <Card.Body padding="compact">
        <div className="flex items-center gap-12">
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-(--bg3) text-(--muted)">
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <Title variant="micro" color="muted2">
              Ponto de partida
            </Title>
            <Title variant="body-sm" weight="medium">
              {label}
            </Title>
            <Title
              variant="body-sm"
              color="muted"
              className="mt-[2px] truncate"
            >
              {detail}
            </Title>
          </div>
          {canEdit && (
            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              noUppercase
              onClick={() => setOpen(true)}
              className="shrink-0"
            >
              <Button.Icon icon={Pencil} />
              <Button.Title>Alterar</Button.Title>
            </Button.Root>
          )}
        </div>
      </Card.Body>

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
    </Card.Root>
  );
}
