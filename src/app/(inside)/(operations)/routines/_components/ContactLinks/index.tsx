"use client";

import { MessageCircle, Phone, PhoneOff, UserPlus } from "lucide-react";
import { useApolloClient } from "@apollo/client/react";
import { Button } from "@/components/Button";
import { getButtonClasses } from "@/components/Button/Root/style";
import { Title } from "@/components/Title";
import { useUserData } from "@/hooks/useUserData";
import { maskPhoneBR } from "@/utils/format/masks";
import { telHref, whatsappHref } from "@/utils/phone";
import { AddClientContactModal } from "../../../_components/AddClientContactModal";
import { VisitPrimaryContact } from "../../interface";
import { remoteContactMessage } from "./utils";

interface Props {
  contact: VisitPrimaryContact | null;
  clientName: string;
  /**
   * Id global do cliente — é o que permite cadastrar o contato ali mesmo quando
   * falta telefone. Sem ele, o card só avisa que não há número.
   */
  clientId?: string | null;
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
 * caderno. WhatsApp só aparece em celular (`whatsappHref` recusa fixo), e já
 * abre com a mensagem pronta — cumprimento pela hora, o nome do contato e a
 * apresentação de quem fala.
 *
 * Sem telefone, o botão "Cadastrar contato" abre o mesmo cadastro da ficha do
 * cliente, sem sair da rotina. Ao salvar, as telas abertas se recarregam e o
 * card passa a mostrar "Ligar"/"WhatsApp".
 */
export function ContactLinks({ contact, clientName, clientId }: Props) {
  const apollo = useApolloClient();
  const { userData } = useUserData();

  const tel = telHref(contact?.phone);
  const zap = whatsappHref(
    contact?.phone,
    remoteContactMessage({
      contactName: contact?.name,
      sellerName: userData?.userName,
      companyName: userData?.companyName,
    })
  );

  // O card inteiro é clicável (abre o painel da visita), e o modal de cadastro
  // é portal — o React propaga eventos através do portal. Sem parar aqui, cada
  // clique no formulário abriria o painel por trás.
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  if (!tel) {
    return (
      <span
        className="inline-flex flex-wrap items-center gap-8"
        onClick={stop}
        onKeyDown={stop}
      >
        <span className="inline-flex items-center gap-6">
          <PhoneOff size={14} aria-hidden className="shrink-0 text-(--fg3)" />
          <Title variant="micro" color="muted">
            Sem telefone cadastrado
          </Title>
        </span>
        {clientId && (
          <AddClientContactModal
            clientId={clientId}
            phoneRequired
            onAdded={async () => {
              // A rotina lê o contato pelo `primaryContact` do cliente, dentro
              // das consultas da semana e do dia: recarregar as abertas é o que
              // faz o card trocar o aviso pelos botões.
              await apollo.refetchQueries({ include: "active" });
            }}
            trigger={
              <Button.Root
                appearance="outline"
                color="neutral"
                size="sm"
                noUppercase
              >
                <Button.Icon icon={UserPlus} />
                <Button.Title>Cadastrar contato</Button.Title>
              </Button.Root>
            }
          />
        )}
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
          title={`Abrir WhatsApp de ${clientName} com a mensagem pronta`}
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
