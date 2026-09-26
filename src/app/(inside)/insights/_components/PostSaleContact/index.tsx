"use client";
import { Button } from "@/components/Button";

import { Tooltip } from "@/components/Tooltip";
import { whatsappHref } from "@/utils/phone";
import { MessageCircle, UserPlus } from "lucide-react";

import { InsightSample } from "../../interface";
import { postSaleMessage } from "../../utils";

/**
 * O contato do pós-venda: WhatsApp com a mensagem pronta ("Olá, bom dia! ...
 * o pedido da Herc feito em 30/07/2026 já foi entregue?").
 *
 * Sem celular cadastrado não há link de WhatsApp — o `wa.me` com número fixo
 * cai numa tela de erro. Em vez de um botão morto, o caminho para resolver:
 * cadastrar o contato na ficha do cliente.
 */
export function PostSaleContact({ sample }: { sample: InsightSample }) {
  const href = whatsappHref(sample.contactPhone, postSaleMessage(sample));

  if (href) {
    return (
      <Button.Link
        href={href}
        external
        appearance="outline"
        color="neutral"
        size="xs"
        noUppercase
        aria-label={`Perguntar pelo WhatsApp se o pedido de ${sample.label} foi entregue`}
      >
        <Button.Icon icon={MessageCircle} />
        <Button.Title>WhatsApp</Button.Title>
      </Button.Link>
    );
  }

  if (!sample.clientLink) return null;

  return (
    <Tooltip content="Este cliente não tem celular cadastrado. Cadastre um contato para mandar a mensagem de pós-venda pelo WhatsApp.">
      <Button.Link
        href={sample.clientLink}
        appearance="outline"
        color="neutral"
        size="xs"
        noUppercase
      >
        <Button.Icon icon={UserPlus} />
        <Button.Title>Cadastrar contato</Button.Title>
      </Button.Link>
    </Tooltip>
  );
}
