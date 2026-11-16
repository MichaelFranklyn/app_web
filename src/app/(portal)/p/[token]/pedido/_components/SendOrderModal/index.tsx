"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Send } from "lucide-react";
import { useState } from "react";
import { OrderFormState } from "../../interface";
import { productCountLabel } from "../../utils";

interface SendOrderModalProps {
  count: number;
  estimate: number | null;
  note: string;
  onNote: (note: string) => void;
  /** Alguma quantidade fora da embalagem mínima: não dá para enviar. */
  hasErrors: boolean;
  state: OrderFormState;
  isSending: boolean;
  /** Submete o formulário da lista (o mesmo da caixa lateral). */
  onConfirm: () => void;
}

/**
 * O "Enviar ao representante" do cabeçalho. O recado não cabe no cabeçalho,
 * então o botão abre este modal: o resumo, o recado (o MESMO da caixa
 * lateral — escrito lá, aparece aqui) e a confirmação.
 *
 * O envio é o do formulário da lista: o modal fica aberto, com o botão
 * carregando, até a tela trocar para o pedido enviado.
 */
export function SendOrderModal({
  count,
  estimate,
  note,
  onNote,
  hasErrors,
  state,
  isSending,
  onConfirm,
}: SendOrderModalProps) {
  const [open, setOpen] = useState(false);
  const summary =
    estimate !== null
      ? `${productCountLabel(count)} · total estimado ${formatMoney(estimate)}`
      : productCountLabel(count);

  return (
    <Modal.Root
      open={open}
      onOpenChange={(next) => !isSending && setOpen(next)}
    >
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" disabled={count === 0}>
          <Button.Icon icon={Send} />
          <Button.Title>Enviar ao representante</Button.Title>
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Header title="Enviar ao representante" description={summary} />
        <Modal.Body className="flex flex-col gap-12">
          <Input.Textarea
            id="note-modal"
            label="Recado para o representante"
            placeholder="Ex: preciso da entrega até sexta"
            maxLength={500}
            rows={3}
            value={note}
            onChange={(event) => onNote(event.target.value)}
          />
          {hasErrors ? (
            <Alert.Root variant="error">
              <Alert.Description>
                Há quantidades fora da embalagem mínima. Confira na lista antes
                de enviar.
              </Alert.Description>
            </Alert.Root>
          ) : null}
          {state.status === "error" ? (
            <Alert.Root variant="error">
              <Alert.Description>{state.message}</Alert.Description>
            </Alert.Root>
          ) : null}
          <Title variant="body-xs" color="muted">
            Nada é comprado agora: o representante confere preço, condição e
            frete e confirma com você antes de mandar para a fábrica.
          </Title>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              appearance="outline"
              color="neutral"
              disabled={isSending}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            appearance="solid"
            color="amber"
            disabled={hasErrors}
            loading={isSending}
            onClick={onConfirm}
          >
            <Button.Icon icon={Send} />
            <Button.Title>Enviar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
