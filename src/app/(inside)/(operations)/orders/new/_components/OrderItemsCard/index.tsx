"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { useIsOffline } from "@/hooks/useIsOffline";

import {
  OrderDraftItems,
  PaymentTermMinimum,
  StepItems,
} from "../../../../_shared/orderDraftItems";
import { FreeFreightTarget } from "../../../../_shared/orderFreight";
import { ImportItemsModal } from "./ImportItemsModal";

interface Props {
  draft: OrderDraftItems;
  /**
   * Todos os campos obrigatórios de "Dados do pedido" estão preenchidos (e a
   * fábrica, definida). Antes disso o formulário de item nem aparece.
   */
  isUnlocked: boolean;
  minimum?: PaymentTermMinimum | null;
  freeFreight?: FreeFreightTarget | null;
  /** Fábrica escolhida — a importação casa os produtos no catálogo dela. */
  factoryId?: string | null;
  clientId?: string | null;
}

export function OrderItemsCard({
  draft,
  isUnlocked,
  minimum,
  freeFreight,
  factoryId,
  clientId,
}: Props) {
  const isOffline = useIsOffline();
  const canImport = isUnlocked && Boolean(factoryId) && draft.hasCatalog;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Itens
        </Card.Header.Title>
        <Card.Header.Description>
          {canImport
            ? "Adicione um produto de cada vez ou importe de uma planilha. Nada é gravado até você clicar em “Criar pedido”."
            : "Adicione um produto de cada vez. Nada é gravado até você clicar em “Criar pedido”."}
          {canImport && isOffline
            ? " Sem internet agora: a importação volta quando a conexão voltar."
            : ""}
        </Card.Header.Description>
        {canImport && factoryId ? (
          <Card.Header.Actions>
            <ImportItemsModal
              draft={draft}
              factoryId={factoryId}
              clientId={clientId}
              disabled={isOffline}
            />
          </Card.Header.Actions>
        ) : null}
      </Card.Header>
      <Card.Body>
        {isUnlocked ? (
          <StepItems
            draft={draft}
            minimum={minimum}
            freeFreight={freeFreight}
          />
        ) : (
          // Dizer o que falta, em vez de um formulário travado sem explicação.
          <Title variant="body-md" color="muted">
            Preencha os campos com * em “Dados do pedido” para liberar os itens.
            {keptItemsNote(draft.items.length)}
          </Title>
        )}
      </Card.Body>
    </Card.Root>
  );
}

/** Itens já postos não somem quando um campo de cima é apagado. */
function keptItemsNote(count: number): string {
  if (count === 0) return "";
  if (count === 1) return " O item já adicionado continua guardado.";
  return ` Os ${count} itens já adicionados continuam guardados.`;
}
