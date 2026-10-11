"use client";

import { Button } from "@/components/Button";
import { ArrowRight } from "lucide-react";

import { PendingItem } from "../../interface";
import { destinationLabel } from "../../utils";
import { PostSaleContact } from "../PostSaleContact";

interface Props {
  item: PendingItem;
  /** "Volte dia X": agendar o contato já vinculado a este retorno. */
  onScheduleReturn?: (item: PendingItem) => void;
}

/**
 * O que se faz com uma pendência — sempre FORA daqui: a ação leva aonde ela se
 * resolve (o pedido, o contato, o cadastro). Não existe botão de baixa.
 *
 * O "Ver cliente" só aparece quando o destino principal NÃO é a ficha do
 * cliente — senão seriam dois caminhos para o mesmo lugar.
 */
export function PendingActions({ item, onScheduleReturn }: Props) {
  const clientLink =
    item.clientLink && item.clientLink !== item.link ? item.clientLink : null;

  return (
    <div className="flex flex-wrap items-center gap-6">
      {item.link && (
        <Button.Link
          href={item.link}
          appearance="outline"
          color="neutral"
          size="xs"
          noUppercase
        >
          <Button.Title>{destinationLabel(item.type)}</Button.Title>
          <Button.Icon icon={ArrowRight} />
        </Button.Link>
      )}
      {/* Pós-venda: a mensagem ao cliente é o trabalho desta pendência. */}
      {item.reason === "DELIVERY_UNCONFIRMED" && (
        <PostSaleContact item={item} />
      )}
      {/* O contato agendado daqui nasce vinculado ao retorno: concluí-lo
          resolve o "volte dia X" (um contato qualquer não resolve). */}
      {item.reason === "RETURN_DATE" && onScheduleReturn && (
        <Button.Root
          type="button"
          appearance="ghost"
          color="neutral"
          size="xs"
          noUppercase
          onClick={() => onScheduleReturn(item)}
        >
          <Button.Title>Agendar contato</Button.Title>
        </Button.Root>
      )}
      {clientLink && (
        <Button.Link
          href={clientLink}
          appearance="ghost"
          color="neutral"
          size="xs"
          noUppercase
        >
          <Button.Title>Ver cliente</Button.Title>
        </Button.Link>
      )}
    </div>
  );
}
