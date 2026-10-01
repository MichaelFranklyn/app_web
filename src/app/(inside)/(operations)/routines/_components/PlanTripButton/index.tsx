"use client";

import { Button } from "@/components/Button";
import { MapPinned } from "lucide-react";
import { useState } from "react";

import { TripPlannerModal } from "./TripPlannerModal";

interface Props {
  /** Vendedor da rotina em tela — a carteira de onde saem as cidades. */
  sellerId: string | null;
  /** Depois de gravar: a semana e a lista de viagens recarregam. */
  onPlanned: () => void;
}

/**
 * "Planejar viagem" no cabeçalho da rotina.
 *
 * A rotina da semana parte de casa, e o cliente longe vira ligação. Quando o
 * vendedor vai passar uns dias numa região, é aqui que ele avisa — e a rotina
 * desses dias passa a ser a da região.
 */
export function PlanTripButton({ sellerId, onPlanned }: Props) {
  const [open, setOpen] = useState(false);

  if (!sellerId) return null;

  return (
    <>
      <Button.Root
        type="button"
        appearance="outline"
        color="amber"
        size="sm"
        noUppercase
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={MapPinned} />
        <Button.Title>Planejar viagem</Button.Title>
      </Button.Root>

      <TripPlannerModal
        open={open}
        onOpenChange={setOpen}
        sellerId={sellerId}
        onPlanned={onPlanned}
      />
    </>
  );
}
