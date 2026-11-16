import { ShareEmail } from "./ShareEmail";
import { ShareWhatsapp } from "./ShareWhatsapp";

/**
 * Compartilhar pelo navegador — o padrão da plataforma para email e WhatsApp
 * sem integração: botão → prévia (para quem, assunto, mensagem) → o aplicativo
 * do aparelho abre preenchido.
 *
 * É um modal: não use dentro de outro modal (lá, o link direto).
 */
export const Share = { Email: ShareEmail, Whatsapp: ShareWhatsapp };
export { mailtoHref, whatsappShareHref } from "./utils";
