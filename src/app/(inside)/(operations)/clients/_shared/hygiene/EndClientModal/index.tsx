"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef } from "react";
import { END_COMPANY_CLIENT_MUTATION } from "../gql";
import { EndCompanyClientResponse, EndingStatus } from "../interface";

interface Props {
  companyClientId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Qual opção já vem marcada — o menu diz de onde o usuário veio. */
  initialStatus: EndingStatus;
  onDone: () => void;
}

const FORM_STEPS: FormStepSchema[] = [
  {
    id: "end",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "status",
            type: "radio",
            label: "O que aconteceu com o cliente?",
            required: true,
            options: [
              {
                value: "CLOSED",
                label: "Não existe mais (fechou, CNPJ baixado)",
              },
              {
                value: "ENDED",
                label: "Existe, mas não trabalhamos mais com ele",
              },
            ],
          },
          {
            name: "reason",
            type: "textarea",
            label: "Motivo (opcional)",
            rows: 3,
            maxLength: 255,
            placeholder: "Ex: fechou a loja em agosto",
            hint: "Fica registrado na ficha do cliente, para quem abrir depois entender por que ele saiu.",
          },
        ],
      },
    ],
  },
];

/**
 * Tira o cliente da carteira ativa — sem apagar nada.
 *
 * A descrição diz o que MUDA (sai da rotina, visitas marcadas são canceladas,
 * não aceita pedido, some das listas) e o que FICA (histórico, e dá para
 * voltar atrás). Quem encerra sem saber disso ou encerra com medo de perder
 * o histórico, ou não encerra e deixa a base suja.
 */
export function EndClientModal({
  companyClientId,
  clientName,
  open,
  onOpenChange,
  initialStatus,
  onDone,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const [endCompanyClient] = useMutation<EndCompanyClientResponse>(
    END_COMPANY_CLIENT_MUTATION
  );
  // A opção por onde o usuário entrou (o item do menu) já vem marcada.
  const initialData = useMemo(
    () => ({ status: initialStatus }),
    [initialStatus]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const status = (extractSelectValue(data.status) ||
      initialStatus) as EndingStatus;
    const reason = String(data.reason ?? "").trim();

    await execute(
      async () => {
        const res = await endCompanyClient({
          variables: {
            id: companyClientId,
            input: { status, ...(reason ? { reason } : {}) },
          },
        });
        const payload = res.data?.endCompanyClient;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao encerrar o cliente");
        }
        return payload;
      },
      {
        // A mensagem do servidor diz quantas visitas foram canceladas.
        successMessage: (payload) => payload.message,
        onSuccess: () => {
          onOpenChange(false);
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Tirar cliente da carteira"
          description={`${clientName} sai da rotina de visitas (as visitas e ligações já marcadas são canceladas), deixa de aceitar pedidos e some das listas. O histórico de pedidos e visitas continua guardado, e você pode reativar o cliente quando quiser.`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
            initialData={initialData}
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
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Tirar da carteira</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
