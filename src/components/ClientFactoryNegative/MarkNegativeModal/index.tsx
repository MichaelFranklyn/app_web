"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { SET_CLIENT_FACTORY_NEGATIVE_MUTATION } from "../gql";
import {
  MarkNegativeModalProps,
  SetClientFactoryNegativeResponse,
} from "../interface";

const FORM_STEPS: FormStepSchema[] = [
  {
    id: "negative",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "reason",
            type: "textarea",
            label: "Motivo",
            rows: 3,
            maxLength: 255,
            placeholder: "Ex: boleto de julho protestado",
            hint: "Aparece para quem abrir o cliente. É o que diz ao vendedor o que precisa acontecer para liberar de novo.",
          },
          {
            name: "since",
            type: "date",
            label: "Negativado desde",
            hint: "Deixe em branco para hoje.",
          },
        ],
      },
    ],
  },
];

/**
 * Marca o cliente como negativado NESTA fábrica.
 *
 * O texto insiste em "nesta fábrica" porque a confusão possível é cara: quem
 * entende que está bloqueando o cliente inteiro deixa de marcar, e o motor segue
 * mandando o vendedor vender onde não se pode vender.
 */
export function MarkNegativeModal({
  linkId,
  factoryName,
  clientName,
  open,
  onOpenChange,
  onSaved,
}: MarkNegativeModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const [setNegative] = useMutation<SetClientFactoryNegativeResponse>(
    SET_CLIENT_FACTORY_NEGATIVE_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const reason = String(data.reason ?? "").trim();
    // `toIsoDate` porque o campo `date` do FormBuilder não devolve ISO — cortar
    // a string à mão manda a data errada nos fusos a oeste de Greenwich.
    const since = toIsoDate(data.since);

    await execute(
      async () => {
        const res = await setNegative({
          variables: {
            id: linkId,
            input: {
              isNegative: true,
              ...(reason ? { reason } : {}),
              ...(since ? { since } : {}),
            },
          },
        });
        const payload = res.data?.setSellerClientFactoryNegative;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Erro ao registrar a negativação"
          );
        }
        return payload.data;
      },
      {
        successMessage: "Cliente marcado como negativado nesta fábrica",
        onSuccess: (saved) => {
          onOpenChange(false);
          if (saved) {
            onSaved?.({
              isNegative: saved.isNegative,
              negativeSince: saved.negativeSince,
              negativeReason: saved.negativeReason,
            });
          }
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Marcar como negativado"
          description={`${clientName ? `${clientName} fica` : "Este cliente fica"} negativado apenas na fábrica "${factoryName}": ele sai das recomendações de visita dela e não pode receber pedido novo dela. As outras fábricas continuam normais, e as visitas já agendadas seguem na agenda.`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
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
            <Button.Title>Salvar negativação</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
