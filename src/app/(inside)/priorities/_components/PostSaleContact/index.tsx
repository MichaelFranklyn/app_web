"use client";

import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { Share } from "@/components/Share";
import { whatsappHref } from "@/utils/phone";
import { UserPlus } from "lucide-react";

import { PendingItem } from "../../interface";
import { postSaleMessage } from "../../utils";

/**
 * O contato do pós-venda: WhatsApp com a mensagem pronta ("Olá, bom dia! ...
 * o pedido da Herc feito em 30/07/2026 já foi entregue?"), mostrada na prévia
 * do `Share` antes de abrir o WhatsApp.
 *
 * Veio do antigo cartão de entregas de /insights: o pedido parado mora só aqui
 * agora, e a ação de pós-venda veio junto.
 *
 * Sem celular cadastrado não há link de WhatsApp — o `wa.me` com número fixo
 * cai numa tela de erro. Em vez de um botão morto, o caminho para resolver:
 * cadastrar o contato na ficha do cliente.
 */
export function PostSaleContact({ item }: { item: PendingItem }) {
  if (whatsappHref(item.contactPhone)) {
    return (
      <Share.Whatsapp
        phone={item.contactPhone}
        toName={item.clientName}
        message={postSaleMessage(item)}
        title="Perguntar se o pedido foi entregue"
        label="WhatsApp"
        size="xs"
        ariaLabel={`Perguntar pelo WhatsApp se o pedido de ${item.clientName} foi entregue`}
      />
    );
  }

  if (!item.clientLink) return null;

  return (
    <Tooltip content="Este cliente não tem celular cadastrado. Cadastre um contato para mandar a mensagem de pós-venda pelo WhatsApp.">
      <Button.Link
        href={item.clientLink}
        appearance="outline"
        color="neutral"
        size="xs"
      >
        <Button.Icon icon={UserPlus} />
        <Button.Title>Cadastrar contato</Button.Title>
      </Button.Link>
    </Tooltip>
  );
}
