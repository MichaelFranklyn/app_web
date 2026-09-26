"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useRef } from "react";
import { TRANSFER_COMPANY_CLIENT_CNPJ_MUTATION } from "../gql";
import { TransferCompanyClientCnpjResponse } from "../interface";

interface Props {
  companyClientId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recebe o id da carteira do CNPJ novo — a ficha navega para ele. */
  onDone: (newCompanyClientId: string) => void;
}

const FORM_STEPS: FormStepSchema[] = [
  {
    id: "transfer",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "newCnpj",
            type: "cnpj",
            label: "CNPJ novo",
            placeholder: "00.000.000/0000-00",
            required: true,
            hint: "Os dados do CNPJ novo vêm da Receita Federal.",
          },
          {
            name: "reason",
            type: "textarea",
            label: "Motivo (opcional)",
            rows: 2,
            maxLength: 255,
            placeholder: "Ex: a loja passou para o nome do filho",
          },
        ],
      },
    ],
  },
];

/**
 * O cliente mudou de CNPJ: a relação vai para o CNPJ novo.
 *
 * O texto separa o que VAI (vendedor, nível de preço, contatos, rede,
 * anotações) do que FICA (os pedidos antigos, que têm nota no CNPJ antigo).
 * É a pergunta que o usuário faz antes de clicar: "vou perder o histórico?".
 */
export function TransferCnpjModal({
  companyClientId,
  clientName,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const [transfer] = useMutation<TransferCompanyClientCnpjResponse>(
    TRANSFER_COMPANY_CLIENT_CNPJ_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const newCnpj = String(data.newCnpj ?? "").replace(/\D/g, "");
    const reason = String(data.reason ?? "").trim();

    await execute(
      async () => {
        const res = await transfer({
          variables: {
            id: companyClientId,
            input: { newCnpj, ...(reason ? { reason } : {}) },
          },
        });
        const payload = res.data?.transferCompanyClientCnpj;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao mudar o CNPJ");
        }
        return payload.data;
      },
      {
        successMessage: (moved) =>
          `Cliente transferido para o CNPJ novo, com ${moved.movedLinks} vínculo(s) de fábrica. Os pedidos antigos continuam no CNPJ anterior.`,
        onSuccess: (moved) => {
          onOpenChange(false);
          onDone(moved.newCompanyClient.id);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="O cliente mudou de CNPJ"
          description={`Vão para o CNPJ novo: o vendedor e o nível de preço de ${clientName} em cada fábrica, os contatos, as rotas fixas, o apelido, a rede, o segmento e as anotações. Os pedidos antigos continuam no CNPJ atual (é nele que está a nota), e a ficha antiga fica ligada à nova.`}
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
            <Button.Title>Transferir para o CNPJ novo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
