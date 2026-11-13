import { BadgeColor } from "@/components/Badges/Root/interface";
import { EmailMessageStatus } from "./interface";

export { formatMoment } from "../audit/utils";

export const STATUS_LABEL: Record<EmailMessageStatus, string> = {
  SENT: "Enviado",
  FAILED: "Falhou",
  SUPPRESSED: "Bloqueado",
};

export const STATUS_COLOR: Record<EmailMessageStatus, BadgeColor> = {
  SENT: "green",
  FAILED: "red",
  SUPPRESSED: "neutral",
};

/**
 * O que a Brevo contou depois do envio, na língua de quem atende o cliente.
 * "Enviado" só diz que a Brevo aceitou; é o evento que responde "chegou?".
 */
const EVENT_LABEL: Record<string, string> = {
  delivered: "Entregue",
  soft_bounce: "Caixa recusou por ora",
  deferred: "Entrega adiada",
  hard_bounce: "Endereço não existe",
  invalid_email: "Endereço inválido",
  blocked: "Barrado pela Brevo",
  spam: "Marcado como spam",
  unsubscribed: "Pediu para sair",
  error: "Erro na Brevo",
};

export const eventLabel = (event: string | null): string =>
  event ? (EVENT_LABEL[event] ?? event) : "Sem retorno ainda";

/** Por que o endereço foi bloqueado — a frase que decide se vale liberar. */
const SUPPRESSION_REASON: Record<string, string> = {
  hard_bounce:
    "o servidor de destino disse que este endereço não existe. Liberar só adianta se o cliente corrigiu a caixa.",
  invalid_email: "o endereço tem formato inválido para a Brevo.",
  spam: "a pessoa marcou um email nosso como spam. Libere só se ela pediu para voltar a receber.",
  unsubscribed: "a pessoa pediu para não receber mais.",
};

export const suppressionReasonLabel = (reason: string): string =>
  SUPPRESSION_REASON[reason] ?? `evento "${reason}" da Brevo.`;

/** Uso do dia contra a cota: a partir de 80% a tela avisa, como o alerta do
 * backend. */
export const quotaTone = (sent: number, quota: number): "ok" | "atencao" =>
  quota > 0 && sent / quota >= 0.8 ? "atencao" : "ok";
