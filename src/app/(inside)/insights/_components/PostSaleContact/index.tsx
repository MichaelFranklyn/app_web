"use client";

import { getButtonClasses } from "@/components/Button/Root/style";
import { Tooltip } from "@/components/Tooltip";
import { whatsappHref } from "@/utils/phone";
import { MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";

import { InsightSample } from "../../interface";
import { postSaleMessage } from "../../utils";

const buttonClass = getButtonClasses({
  appearance: "outline",
  color: "neutral",
  size: "xs",
  isIconOnly: false,
  fullWidth: false,
  active: false,
  noPadding: false,
  noUppercase: true,
});

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
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        aria-label={`Perguntar pelo WhatsApp se o pedido de ${sample.label} foi entregue`}
      >
        <MessageCircle size={14} />
        WhatsApp
      </a>
    );
  }

  if (!sample.clientLink) return null;

  return (
    <Tooltip content="Este cliente não tem celular cadastrado. Cadastre um contato para mandar a mensagem de pós-venda pelo WhatsApp.">
      <Link href={sample.clientLink} className={buttonClass}>
        <UserPlus size={14} />
        Cadastrar contato
      </Link>
    </Tooltip>
  );
}
