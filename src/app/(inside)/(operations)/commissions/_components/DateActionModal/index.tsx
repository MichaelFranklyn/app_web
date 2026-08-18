"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { getTodayIso, toIsoDate } from "@/utils/format/date";
import { LucideIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface Props {
  /** Rótulo do botão que abre o modal. Ignorado no modo controlado. */
  label: string;
  icon: LucideIcon;
  color: "amber" | "green" | "red" | "neutral";
  /**
   * Modo controlado: quem abre é o menu de ações da linha, e o modal não
   * renderiza gatilho nenhum. Sem estas props ele traz o próprio botão (a barra
   * de ações em lote usa assim).
   */
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  title: string;
  description: string;
  /** Rótulo do campo de data (ex.: "Data do pagamento"). */
  dateLabel: string;
  dateHint?: string;
  confirmLabel: string;
  successMessage: string;
  disabled?: boolean;
  /** Executa a ação com a data escolhida (ISO). Deve lançar erro em falha. */
  onConfirm: (isoDate: string) => Promise<void>;
  onSuccess: () => void;
}

/**
 * Ação em lote que precisa de uma data: pagar o boleto, marcar calote, registrar
 * o repasse ao vendedor.
 *
 * A data é sempre a REAL do evento, não a de hoje — a informação chega pelo
 * relatório que a fábrica manda dias depois, e é ela que decide em qual
 * fechamento a comissão (ou o estorno) entra.
 */
export function DateActionModal({
  label,
  icon,
  color,
  title,
  description,
  dateLabel,
  dateHint,
  confirmLabel,
  successMessage,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  onConfirm,
  onSuccess,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "action",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "date",
                type: "date",
                label: dateLabel,
                required: true,
                hint: dateHint,
              },
            ],
          },
        ],
      },
    ],
    [dateLabel, dateHint]
  );

  const handleClose = (v: boolean) => {
    if (isControlled) onOpenChange?.(v);
    else setUncontrolledOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const iso = toIsoDate(data.date);
        if (!iso) throw new Error(`Informe a ${dateLabel.toLowerCase()}.`);
        await onConfirm(iso);
      },
      {
        successMessage,
        onSuccess: () => {
          handleClose(false);
          onSuccess();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      {!isControlled && (
        <Modal.Trigger asChild>
          <Button.Root
            appearance="ghost"
            color={color}
            size="sm"
            disabled={disabled}
          >
            <Button.Icon icon={icon} />
            <Button.Title>{label}</Button.Title>
          </Button.Root>
        </Modal.Trigger>
      )}

      <Modal.Content size="sm">
        <Modal.Header title={title} description={description} />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={{ date: getTodayIso() }}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
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
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>{confirmLabel}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
