"use client";

import { MessageCircle, Phone, PhoneOff } from "lucide-react";
import { getButtonClasses } from "@/components/Button/Root/style";
import { Title } from "@/components/Title";
import { maskPhoneBR } from "@/utils/format/masks";
import { telHref, whatsappHref } from "@/utils/phone";
import { VisitPrimaryContact } from "../../interface";

interface Props {
  contact: VisitPrimaryContact | null;
  clientName: string;
}

// Link externo precisa ser <a>, não <button> — mesma solução do RouteMap.
const linkClass = getButtonClasses({
  appearance: "tinted",
  color: "amber",
  size: "sm",
  isIconOnly: false,
  fullWidth: false,
  active: false,
  noPadding: false,
  noUppercase: true,
});

/**
 * Botões "Ligar" e "WhatsApp" do contato principal do cliente.
 *
 * O telefone é a única coisa que faltava para o contato remoto ser executável:
 * sem isto o vendedor via o card, saía do sistema e procurava o número no
 * caderno. WhatsApp só aparece em celular (`whatsappHref` recusa fixo).
 */
export function ContactLinks({ contact, clientName }: Props) {
  const tel = telHref(contact?.phone);
  const zap = whatsappHref(
    contact?.phone,
    `Olá, aqui é o representante. Passando para saber como está o estoque de ${clientName}.`
  );

  if (!tel) {
    return (
      <span className="inline-flex items-center gap-6">
        <PhoneOff size={14} aria-hidden className="shrink-0 text-(--fg3)" />
        <Title variant="micro" color="muted">
          Sem telefone cadastrado
        </Title>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-8">
      <a href={tel} className={linkClass} title={`Ligar para ${clientName}`}>
        <Phone size={14} aria-hidden />
        Ligar
      </a>
      {zap && (
        <a
          href={zap}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          title={`Abrir WhatsApp de ${clientName}`}
        >
          <MessageCircle size={14} aria-hidden />
          WhatsApp
        </a>
      )}
      {contact?.phone && (
        <Title variant="micro" color="muted">
          {contact.name} · {maskPhoneBR(contact.phone)}
        </Title>
      )}
    </div>
  );
}
