import { firstName, greetingFor } from "@/utils/greeting";

interface MessageInput {
  /** Nome do contato no cliente — a mensagem chama a pessoa pelo nome. */
  contactName?: string | null;
  /** Quem manda (o vendedor logado). */
  sellerName?: string | null;
  companyName?: string | null;
  hour?: number;
}

/**
 * A mensagem pronta do contato remoto. Se apresenta (quem fala e de onde) e diz
 * o motivo — estoque e reposição —, que é o que o contato remoto existe para
 * saber. Sem nome, sem empresa: a frase continua de pé, só mais curta.
 */
export const remoteContactMessage = ({
  contactName,
  sellerName,
  companyName,
  hour = new Date().getHours(),
}: MessageInput): string => {
  const who = firstName(contactName);
  const saudacao = `Olá${who ? `, ${who}` : ""}, ${greetingFor(hour)}! Tudo bem?`;
  const seller = firstName(sellerName);
  const intro = seller
    ? `Aqui é ${seller}${companyName ? `, da ${companyName.trim()}` : ""}`
    : "";
  // Nome de empresa terminado em ponto ("Contato Rep.") não ganha um segundo.
  const apresentacao = intro
    ? ` ${intro}${intro.endsWith(".") ? "" : "."}`
    : "";
  return `${saudacao}${apresentacao} Passando para saber como está o estoque e se posso ajudar com alguma reposição.`;
};
