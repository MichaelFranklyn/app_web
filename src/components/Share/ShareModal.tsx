"use client";

import { Button } from "@/components/Button";
import { ButtonSize } from "@/components/Button/Root/interface";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { LucideIcon } from "lucide-react";
import { ReactNode, useState } from "react";

interface ShareModalProps {
  /** Rótulo do botão que abre a prévia. */
  triggerLabel: string;
  triggerIcon: LucideIcon;
  triggerSize?: ButtonSize;
  /** Nome acessível do botão quando o rótulo visível é curto ("WhatsApp"). */
  triggerAriaLabel?: string;
  title: string;
  description?: string;
  /** Os campos da prévia. */
  children: ReactNode;
  /** De onde a mensagem sai — dito na tela, antes do clique. */
  hint: string;
  actionLabel: string;
  actionHref: string;
  /** `wa.me` abre em outra aba; `mailto:` não. */
  external?: boolean;
}

/**
 * Casca comum do compartilhar: botão → prévia do que vai sair → o link que
 * abre o aplicativo (email ou WhatsApp) do próprio aparelho. Ver antes de
 * mandar é o ponto: o app de email abre longe da tela e a pessoa perde o fio.
 */
export function ShareModal({
  triggerLabel,
  triggerIcon,
  triggerSize = "md",
  triggerAriaLabel,
  title,
  description,
  children,
  hint,
  actionLabel,
  actionHref,
  external = false,
}: ShareModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size={triggerSize}
          aria-label={triggerAriaLabel}
        >
          <Button.Icon icon={triggerIcon} />
          <Button.Title>{triggerLabel}</Button.Title>
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="lg">
        <Modal.Header title={title} description={description} />
        <Modal.Body className="flex flex-col gap-12">
          {children}
          <Title variant="body-xs" color="muted">
            {hint}
          </Title>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root type="button" appearance="outline" color="neutral">
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Link
            href={actionHref}
            external={external}
            appearance="solid"
            color="amber"
            onClick={() => setOpen(false)}
          >
            <Button.Icon icon={triggerIcon} />
            <Button.Title>{actionLabel}</Button.Title>
          </Button.Link>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
