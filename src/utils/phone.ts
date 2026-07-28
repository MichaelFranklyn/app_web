import { onlyDigits } from "@/utils/format/masks";

/** DDI do Brasil — o wa.me exige o número em formato internacional. */
const BR_COUNTRY_CODE = "55";

/** Menor telefone brasileiro discável: DDD (2) + número fixo (8). */
const MIN_BR_DIGITS = 10;

/**
 * `tel:` a partir de um telefone cadastrado, ou null se não dá para discar.
 *
 * Devolver null em vez de um link quebrado é o ponto: um botão "Ligar" que abre
 * o discador vazio é pior que botão nenhum.
 */
export const telHref = (phone: string | null | undefined): string | null => {
  const digits = onlyDigits(phone ?? "");
  if (digits.length < MIN_BR_DIGITS) return null;
  return `tel:+${BR_COUNTRY_CODE}${digits}`;
};

/**
 * Link do WhatsApp (wa.me), opcionalmente com mensagem pronta.
 *
 * Só faz sentido em celular: número de 10 dígitos é fixo e não tem WhatsApp,
 * então não geramos o link — evita o vendedor cair na tela de "número inválido".
 */
export const whatsappHref = (
  phone: string | null | undefined,
  message?: string
): string | null => {
  const digits = onlyDigits(phone ?? "");
  if (digits.length !== 11) return null;
  const base = `https://wa.me/${BR_COUNTRY_CODE}${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
