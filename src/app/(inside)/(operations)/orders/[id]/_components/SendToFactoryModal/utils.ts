import { formatMoney, onlyDigits } from "@/utils/format/masks";

/**
 * Monta o telefone no formato que o `wa.me` exige: E.164 sem o `+`.
 *
 * O cadastro guarda o telefone como a pessoa digitou — `(71) 98765-4321`,
 * `71 3648-0327`, às vezes já com o 55 na frente. O link não aceita máscara e
 * não assume país, então um número sem DDI abre a conversa errada (ou nenhuma).
 *
 * Retorna `null` em vez de um palpite quando o número não dá: o botão desligado
 * com o motivo escrito é melhor que abrir o WhatsApp num número inventado, que
 * é como se manda um pedido para o desconhecido.
 */
export function toWhatsAppNumber(
  raw: string | null | undefined
): string | null {
  const digits = onlyDigits(raw ?? "");
  if (!digits) return null;

  // Já tem DDI 55 e um número plausível atrás dele (10 ou 11 dígitos).
  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    return digits;
  }
  // Sem DDI: 11 dígitos é celular com DDD, 10 é fixo com DDD.
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  // 8 ou 9 dígitos é número sem DDD — não há como adivinhar a região, e chutar
  // o DDD da empresa mandaria o pedido para outro estado.
  return null;
}

export interface OrderMessageInput {
  orderCode: string;
  clientName: string;
  clientCity?: string | null;
  clientState?: string | null;
  factoryName: string;
  itemCount: number;
  /** Mercadoria + IPI: é o número que a fábrica confere. */
  totalWithIpi: number;
  paymentTermLabel?: string | null;
  isResend?: boolean;
}

/**
 * A mensagem que vai pré-escrita no WhatsApp.
 *
 * Curta de propósito: quem recebe é o preposto da fábrica, que abre dezenas
 * dessas por dia e precisa saber em três segundos de quem é o pedido e quanto
 * dá. O detalhe está no PDF anexo — repetir item por item aqui só faria a
 * pessoa rolar a conversa para achar o total.
 *
 * A última linha avisa do anexo porque o anexo é MANUAL: o link do `wa.me` não
 * carrega arquivo (a API oficial, que carrega, cobra por conversa e exige
 * aprovação de modelo de mensagem). Sem essa linha, a mensagem sai sozinha e a
 * fábrica recebe um resumo sem o pedido.
 */
export function buildOrderMessage(input: OrderMessageInput): string {
  const local = [input.clientCity, input.clientState].filter(Boolean).join("/");
  const cliente = local ? `${input.clientName} (${local})` : input.clientName;

  const linhas = [
    input.isResend
      ? `*Reenvio — Pedido ${input.orderCode}*`
      : `*Pedido ${input.orderCode}*`,
    `Cliente: ${cliente}`,
    `Fábrica: ${input.factoryName}`,
    `${input.itemCount} ${input.itemCount === 1 ? "item" : "itens"} · ${formatMoney(input.totalWithIpi)}`,
  ];
  if (input.paymentTermLabel) {
    linhas.push(`Condição: ${input.paymentTermLabel}`);
  }
  linhas.push("", "O pedido completo vai no PDF em anexo.");

  return linhas.join("\n");
}

/**
 * O link que abre a conversa com a mensagem pronta.
 *
 * `wa.me` e não `whatsapp://`: o primeiro funciona no navegador do desktop
 * (WhatsApp Web) e no celular, e é o próprio WhatsApp que decide para onde
 * mandar. O esquema nativo só funciona onde o app está instalado, e o gestor
 * confere pedido no computador.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface FactoryContact {
  name: string;
  phone?: string | null;
  isPrimary?: boolean;
}

/**
 * Para quem mandar: o contato principal, ou o primeiro com telefone utilizável.
 *
 * O principal vem primeiro porque é a escolha que a representação já registrou.
 * Mas principal sem telefone não serve de nada aqui — daí o desempate cair no
 * próximo que tenha número válido, em vez de desistir e desabilitar o botão.
 */
export function pickFactoryContact(
  contacts: FactoryContact[] | null | undefined
): { contact: FactoryContact; phone: string } | null {
  const utilizaveis = (contacts ?? [])
    .map((contact) => ({ contact, phone: toWhatsAppNumber(contact.phone) }))
    .filter((c): c is { contact: FactoryContact; phone: string } => !!c.phone);

  if (!utilizaveis.length) return null;
  return utilizaveis.find((c) => c.contact.isPrimary) ?? utilizaveis[0];
}
