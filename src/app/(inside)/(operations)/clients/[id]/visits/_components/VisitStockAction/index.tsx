"use client";

import { Button } from "@/components/Button";
import { VisitStockModal } from "@/components/VisitStockModal";
import { Package } from "lucide-react";
import { useState } from "react";

interface Props {
  visitId: string;
  clientName: string;
  onSaved?: () => void;
}

/**
 * Registra o estoque do cliente por fábrica a partir do histórico de visitas.
 *
 * O vendedor nem sempre anota no balcão: aqui ele volta na visita e diz o que
 * viu em cada fábrica. Cada marcação corrige a previsão de esgotamento daquele
 * produto e, com isso, a urgência do próximo score.
 */
export function VisitStockAction({ visitId, clientName, onSaved }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button.Root
        appearance="ghost"
        color="neutral"
        size="sm"
        aria-label="Registrar estoque da visita"
        title="Registrar estoque da visita"
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={Package} />
      </Button.Root>

      <VisitStockModal
        itemId={visitId}
        clientName={clientName}
        open={open}
        onOpenChange={setOpen}
        onSaved={onSaved}
      />
    </>
  );
}
