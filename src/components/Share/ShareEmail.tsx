"use client";

import { ButtonSize } from "@/components/Button/Root/interface";
import { Mail } from "lucide-react";
import { PreviewField } from "./PreviewField";
import { ShareModal } from "./ShareModal";
import { mailtoHref, recipientLabel } from "./utils";

export interface ShareEmailProps {
  /** Endereço de quem recebe. */
  to: string;
  /** Nome de quem recebe, mostrado junto do endereço na prévia. */
  toName?: string | null;
  subject: string;
  body: string;
  /** Título do modal (padrão: o rótulo do botão). */
  title?: string;
  description?: string;
  label?: string;
  size?: ButtonSize;
  /** Nome acessível do botão, quando o rótulo visível é curto. */
  ariaLabel?: string;
}

/**
 * Enviar por email PELO NAVEGADOR: ainda não há envio pelo sistema, então a
 * prévia mostra para quem, o assunto e a mensagem, e o botão abre o app de
 * email do aparelho (`mailto:`) já preenchido — a pessoa confere e envia de lá.
 */
export function ShareEmail({
  to,
  toName,
  subject,
  body,
  title,
  description,
  label = "Enviar por email",
  size,
  ariaLabel,
}: ShareEmailProps) {
  return (
    <ShareModal
      triggerLabel={label}
      triggerIcon={Mail}
      triggerSize={size}
      triggerAriaLabel={ariaLabel}
      title={title ?? label}
      description={description}
      hint="O email abre no seu aplicativo de email (Gmail, Outlook…), já preenchido. Confira e envie de lá."
      actionLabel="Abrir no meu email"
      actionHref={mailtoHref({ to, subject, body })}
    >
      <PreviewField label="Para">{recipientLabel(to, toName)}</PreviewField>
      <PreviewField label="Assunto">{subject}</PreviewField>
      <PreviewField label="Mensagem" multiline>
        {body}
      </PreviewField>
    </ShareModal>
  );
}
