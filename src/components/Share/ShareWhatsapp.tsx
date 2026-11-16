"use client";

import { ButtonSize } from "@/components/Button/Root/interface";
import { maskPhoneBR } from "@/utils/format/masks";
import { whatsappHref } from "@/utils/phone";
import { MessageCircle } from "lucide-react";
import { PreviewField } from "./PreviewField";
import { ShareModal } from "./ShareModal";
import { whatsappShareHref } from "./utils";

export interface ShareWhatsappProps {
  /** Celular de quem recebe; sem ele, a pessoa escolhe a conversa no WhatsApp. */
  phone?: string | null;
  toName?: string | null;
  message: string;
  title?: string;
  description?: string;
  label?: string;
  size?: ButtonSize;
  /** Nome acessível do botão, quando o rótulo visível é curto. */
  ariaLabel?: string;
}

/**
 * Enviar pelo WhatsApp com a mensagem pronta: a prévia mostra para quem e o
 * texto, e o botão abre o WhatsApp (`wa.me`) em outra aba.
 */
export function ShareWhatsapp({
  phone,
  toName,
  message,
  title,
  description,
  label = "Enviar por WhatsApp",
  size,
  ariaLabel,
}: ShareWhatsappProps) {
  const hasPhone = whatsappHref(phone) !== null;
  const recipient = hasPhone
    ? [toName, maskPhoneBR(phone ?? "")].filter(Boolean).join(" · ")
    : "Você escolhe a conversa no WhatsApp";

  return (
    <ShareModal
      triggerLabel={label}
      triggerIcon={MessageCircle}
      triggerSize={size}
      triggerAriaLabel={ariaLabel}
      title={title ?? label}
      description={description}
      hint="O WhatsApp abre em outra aba com a mensagem já escrita. Confira e envie de lá."
      actionLabel="Abrir o WhatsApp"
      actionHref={whatsappShareHref(phone, message)}
      external
    >
      <PreviewField label="Para">{recipient}</PreviewField>
      <PreviewField label="Mensagem" multiline>
        {message}
      </PreviewField>
    </ShareModal>
  );
}
