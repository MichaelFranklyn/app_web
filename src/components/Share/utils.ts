import { whatsappHref } from "@/utils/phone";

export interface MailDraft {
  to: string;
  subject: string;
  body: string;
}

/** `mailto:` com assunto e corpo — o email sai do aplicativo do aparelho. */
export const mailtoHref = ({ to, subject, body }: MailDraft): string =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * WhatsApp com a mensagem pronta. Com celular válido, abre a conversa dele;
 * sem, o `wa.me` sem número deixa a pessoa escolher a conversa — melhor que
 * esconder o botão de quem sabe com quem falar.
 */
export const whatsappShareHref = (
  phone: string | null | undefined,
  message: string
): string =>
  whatsappHref(phone, message) ??
  `https://wa.me/?text=${encodeURIComponent(message)}`;

/** "Rafael <rafael@x.com>" quando há nome; só o endereço quando não há. */
export const recipientLabel = (
  address: string,
  name?: string | null
): string => (name ? `${name} <${address}>` : address);
