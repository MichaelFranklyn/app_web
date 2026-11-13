"use client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { ToggleGroup } from "@/components/ToggleGroup";
import { Mail, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { OrderDetail } from "../../interface";
import { EmailStep } from "./EmailStep";
import { SendChannel } from "./interface";
import { useFactoryContacts } from "./useFactoryContacts";
import { useSendToFactory } from "./useSendToFactory";
import { WhatsAppStep } from "./WhatsAppStep";

interface Props {
  order: OrderDetail;
  onSuccess: () => void;
}

const CHANNELS = [
  { value: "WHATSAPP" as const, label: "WhatsApp", icon: MessageCircle },
  { value: "EMAIL" as const, label: "Email", icon: Mail },
];

/**
 * Manda o pedido para a fábrica, pelo WhatsApp ou por email, e registra o envio.
 *
 * O canal começa no que a fábrica tem: telefone válido → WhatsApp; só email →
 * email. A pessoa troca quando quiser. O "como" de cada porta está no
 * `useSendToFactory`; aqui fica só a escolha.
 */
export function SendToFactoryModal({ order, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [picked, setPicked] = useState<SendChannel | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);

  const { loading, whatsAppTarget, emailTargets } = useFactoryContacts(
    order.factory?.id,
    open
  );

  const reset = () => {
    setNote("");
    setPicked(null);
    setContactId(null);
  };
  const { sendViaWhatsApp, sendViaEmail, isLoading, isResend } =
    useSendToFactory(order, () => {
      setOpen(false);
      reset();
      onSuccess();
    });

  const channel: SendChannel =
    picked ?? (!whatsAppTarget && emailTargets.length ? "EMAIL" : "WHATSAPP");
  const emailTo = contactId ?? emailTargets[0]?.id ?? null;
  const canSend = channel === "WHATSAPP" ? !!whatsAppTarget : !!emailTo;

  const handleSend = () => {
    if (channel === "WHATSAPP" && whatsAppTarget) {
      void sendViaWhatsApp(whatsAppTarget.phone, note);
    } else if (channel === "EMAIL" && emailTo) {
      void sendViaEmail(emailTo, note);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) reset();
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance={isResend ? "outline" : "solid"}
          color={isResend ? "neutral" : "amber"}
          size="sm"
        >
          <Button.Icon icon={Send} />
          <Button.Title>
            {isResend ? "Reenviar à fábrica" : "Enviar à fábrica"}
          </Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title={isResend ? "Reenviar para a fábrica" : "Enviar para a fábrica"}
          description="Escolha por onde mandar o PDF do pedido. O envio fica registrado no pedido, com a data e o seu nome."
        />
        <Modal.Body>
          <div className="flex flex-col gap-16">
            <ToggleGroup
              aria-label="Por onde enviar"
              options={CHANNELS}
              value={channel}
              onChange={setPicked}
              fullWidth
              disabled={isLoading}
            />

            {loading ? (
              <Title variant="body-sm" color="muted">
                Buscando os contatos da fábrica…
              </Title>
            ) : channel === "WHATSAPP" ? (
              <WhatsAppStep target={whatsAppTarget} />
            ) : (
              <EmailStep
                targets={emailTargets}
                selectedId={emailTo}
                onSelect={setContactId}
              />
            )}

            {!loading && canSend && (
              <Input.Text
                label="Observação (opcional)"
                hint={
                  channel === "EMAIL"
                    ? "Vai no email para a fábrica e fica registrada no pedido."
                    : "Fica registrada no pedido, junto com a data e o seu nome."
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex.: cliente pediu entrega até sexta"
                maxLength={200}
              />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            disabled={!canSend || loading || isLoading}
            onClick={handleSend}
          >
            <Button.Title>
              {channel === "EMAIL"
                ? "Enviar por email"
                : isResend
                  ? "Baixar e reenviar"
                  : "Baixar PDF e abrir WhatsApp"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
