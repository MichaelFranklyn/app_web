"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";

import {
  OrderDraftItems,
  PaymentTermMinimum,
  StepItems,
} from "../../../../_shared/orderDraftItems";
import { FreeFreightTarget } from "../../../../_shared/orderFreight";

interface Props {
  draft: OrderDraftItems;
  /** Sem fábrica não há catálogo: o formulário de item nem aparece. */
  hasFactory: boolean;
  /** O que falta escolher para os itens aparecerem (muda com a origem). */
  pendingHint: string;
  minimum?: PaymentTermMinimum | null;
  freeFreight?: FreeFreightTarget | null;
}

export function OrderItemsCard({
  draft,
  hasFactory,
  pendingHint,
  minimum,
  freeFreight,
}: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Itens (opcional)
        </Card.Header.Title>
        <Card.Header.Description>
          Adicione um produto de cada vez. Nada é gravado até você clicar em
          “Criar pedido”.
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        {hasFactory ? (
          <StepItems
            draft={draft}
            minimum={minimum}
            freeFreight={freeFreight}
          />
        ) : (
          // Dizer o que falta, em vez de um formulário travado sem explicação.
          <Title variant="body-md" color="muted">
            {pendingHint}
          </Title>
        )}
      </Card.Body>
    </Card.Root>
  );
}
