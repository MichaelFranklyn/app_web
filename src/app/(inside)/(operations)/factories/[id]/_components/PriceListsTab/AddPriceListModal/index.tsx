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
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { FactoryPriceListNode } from "../gql";
import { CREATE_FACTORY_PRICE_LIST_MUTATION } from "./gql";

interface CreatePriceListResponse {
  createFactoryPriceList: {
    __typename?: "FactoryPriceListTypeDataResponse";
    status: boolean;
    message: string;
    data: FactoryPriceListNode | null;
  };
}

interface Props {
  companyFactoryId: string;
  onAdded: () => void;
  onAddOptimistic: (priceList: FactoryPriceListNode) => void;
}

export function AddPriceListModal({
  companyFactoryId,
  onAdded,
  onAddOptimistic,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [createPriceList] = useMutation<CreatePriceListResponse>(
    CREATE_FACTORY_PRICE_LIST_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "priceList",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "name",
                type: "text",
                label: "Nome da tabela",
                required: true,
                placeholder: "Ex: Tabela 2026",
              },
              {
                name: "region",
                type: "text",
                label: "Região (opcional)",
                required: false,
                placeholder: "Ex: NORDESTE, ICMS 7% — vazio = geral",
                hint: "Tabelas de regiões diferentes podem ficar ativas ao mesmo tempo.",
              },
              {
                name: "validFrom",
                type: "date",
                label: "Vigência início",
                required: true,
              },
              {
                name: "validUntil",
                type: "date",
                label: "Vigência fim (opcional)",
                required: false,
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const validUntil = toIsoDate(data.validUntil);
    const name = String(data.name ?? "").trim();
    const region = String(data.region ?? "").trim();
    const validFrom = toIsoDate(data.validFrom);
    await execute(
      async () => {
        const res = await createPriceList({
          variables: {
            input: {
              companyFactoryId,
              name,
              region,
              validFrom,
              validUntil: validUntil || null,
            },
          },
        });
        if (
          !res.data?.createFactoryPriceList?.status ||
          !res.data.createFactoryPriceList.data
        ) {
          throw new Error(
            res.data?.createFactoryPriceList?.message ??
              "Erro ao criar tabela de preços"
          );
        }
        return res.data.createFactoryPriceList.data;
      },
      {
        successMessage: "Tabela de preços criada com sucesso",
        onSuccess: async (created) => {
          handleClose(false);
          onAddOptimistic(created);
          onAdded();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Nova tabela</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Nova tabela de preços"
          description="Crie uma tabela para vincular preços aos produtos desta fábrica."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
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
            <Button.Title>Criar tabela</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
