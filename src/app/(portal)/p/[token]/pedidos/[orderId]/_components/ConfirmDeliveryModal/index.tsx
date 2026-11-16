"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { getTodayIso, toIsoDate } from "@/utils/format/date";
import { PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { confirmPortalOrderDeliveryAction } from "../../actions";

interface ConfirmDeliveryModalProps {
  token: string;
  orderId: string;
}

const STEPS: FormStepSchema[] = [
  {
    id: "deliver",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "deliveredAt",
            type: "date",
            label: "Dia em que chegou",
            placeholder: "dd/mm/aaaa",
            required: true,
          },
        ],
      },
    ],
  },
];

/**
 * "Confirmar entrega": o cliente avisa que a mercadoria chegou. Um campo só —
 * a data, que já vem com hoje — e o botão. O modal fica aberto, carregando,
 * até a tela voltar com o pedido como entregue.
 */
export function ConfirmDeliveryModal({
  token,
  orderId,
}: ConfirmDeliveryModalProps) {
  const router = useRouter();
  const formRef = useRef<FormBuilderRef>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const isBusy = isSaving || isRefreshing;

  const initialData = useMemo(() => ({ deliveredAt: getTodayIso() }), []);

  const handleOpenChange = (next: boolean) => {
    if (isBusy) return;
    setOpen(next);
    if (!next) {
      setError(null);
      formRef.current?.resetForm();
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const deliveredAt = toIsoDate(data.deliveredAt);
    if (!deliveredAt) {
      setError("Informe o dia em que o pedido chegou.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const result = await confirmPortalOrderDeliveryAction(
        token,
        orderId,
        deliveredAt
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      startRefresh(() => {
        router.refresh();
        setOpen(false);
      });
    } catch {
      setError("Não foi possível confirmar agora. Tente de novo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber">
          <Button.Icon icon={PackageCheck} />
          <Button.Title>Confirmar entrega</Button.Title>
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Header
          title="O pedido chegou?"
          description="Confirme o dia em que a mercadoria chegou na sua loja. O seu representante fica sabendo."
        />
        <Modal.Body className="flex flex-col gap-12">
          <FormBuilder
            ref={formRef}
            steps={STEPS}
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={isBusy}
            unstyled
          />
          {error ? (
            <Alert.Root variant="error">
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root appearance="outline" color="neutral" disabled={isBusy}>
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            appearance="solid"
            color="amber"
            loading={isBusy}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Icon icon={PackageCheck} />
            <Button.Title>Confirmar entrega</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
