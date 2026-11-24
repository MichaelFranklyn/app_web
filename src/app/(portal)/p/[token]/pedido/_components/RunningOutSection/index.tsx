"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { useState } from "react";
import { PortalReplenishmentItem } from "../../../interface";
import { sortStockByUrgency, stockUrgency } from "../../../utils";
import { OrderableProduct } from "../../interface";
import { ProductTable } from "../ProductTable";

/** Quantos aparecem antes do "Ver todos": o resto empurraria o catálogo. */
const PREVIEW_SIZE = 6;

interface RunningOutSectionProps {
  token: string;
  items: PortalReplenishmentItem[];
  horizonDays: number;
  isInCart: (productId: string) => boolean;
  onAdd: (item: OrderableProduct) => void;
  onRemove: (productId: string) => void;
}

/**
 * "Está acabando" — o atalho do pedido. Sai da estimativa de estoque (a
 * mesma que move a rotina do representante), do mais urgente para o menos.
 *
 * A estimativa pode estar velha (o cliente comprou fora, vendeu menos): o
 * "Atualizar estoque" leva ao "Meu estoque", onde ele corrige os dias. Link,
 * não campo aqui dentro — esta tela já é o formulário do pedido, e misturar o
 * envio do estoque com o da lista confundiria os dois botões.
 */
export function RunningOutSection({
  token,
  items,
  horizonDays,
  isInCart,
  onAdd,
  onRemove,
}: RunningOutSectionProps) {
  const [showAll, setShowAll] = useState(false);
  if (items.length === 0) return null;

  const sorted = sortStockByUrgency(items);
  const visible = showAll ? sorted : sorted.slice(0, PREVIEW_SIZE);
  const hidden = sorted.length - visible.length;

  return (
    <ProductTable
      title="Está acabando"
      description={`Pelas suas compras, estes produtos devem acabar nos próximos ${horizonDays} dias.`}
      items={visible}
      isInCart={isInCart}
      onAdd={onAdd}
      onRemove={onRemove}
      actions={
        <Button.Link
          href={`/p/${token}/estoque`}
          appearance="outline"
          color="neutral"
          size="md"
        >
          <Button.Title>Atualizar estoque</Button.Title>
        </Button.Link>
      }
      status={{
        label: "Estoque",
        render: (item) => {
          const urgency = stockUrgency(item.daysRemaining);
          return (
            <Badge.Root color={urgency.tone} size="sm">
              <Badge.Text>{urgency.label}</Badge.Text>
            </Badge.Root>
          );
        },
      }}
      footer={
        hidden > 0 || showAll ? (
          <Button.Root
            type="button"
            appearance="ghost"
            color="neutral"
            size="md"
            aria-expanded={showAll}
            onClick={() => setShowAll((value) => !value)}
          >
            <Button.Title>
              {showAll ? "Mostrar menos" : `Ver todos (${sorted.length})`}
            </Button.Title>
          </Button.Root>
        ) : undefined
      }
    />
  );
}
