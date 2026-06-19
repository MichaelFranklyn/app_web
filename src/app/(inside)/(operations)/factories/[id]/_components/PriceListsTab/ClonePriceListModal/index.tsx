"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input/InputSelect";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { toIsoDate } from "@/utils/format/date";
import { useMutation, useQuery } from "@apollo/client/react";
import { Copy } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  buildFactoryPriceListsVariables,
  CLONE_FACTORY_PRICE_LIST_MUTATION,
  FACTORY_PRICE_LISTS_QUERY,
  FactoryPriceListNode,
  FactoryPriceListsData,
} from "../gql";

interface CloneResponse {
  cloneFactoryPriceList: {
    status: boolean;
    message: string;
    data: FactoryPriceListNode | null;
  };
}

interface Props {
  companyFactoryId: string;
  onCloned: () => void;
  onAddOptimistic: (priceList: FactoryPriceListNode) => void;
}

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function ClonePriceListModal({
  companyFactoryId,
  onCloned,
  onAddOptimistic,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const { data } = useQuery<FactoryPriceListsData>(FACTORY_PRICE_LISTS_QUERY, {
    variables: buildFactoryPriceListsVariables(companyFactoryId),
    skip: !open,
  });

  const [clonePriceList] = useMutation<CloneResponse>(
    CLONE_FACTORY_PRICE_LIST_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const sourceOptions: SelectOption[] = useMemo(
    () =>
      data?.factory_price_lists.edges.map((e) => ({
        value: e.node.id,
        label: e.node.isActive ? `${e.node.name} (ativa)` : e.node.name,
      })) ?? [],
    [data]
  );

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "clone",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "sourcePriceListId",
                type: "select-single",
                label: "Copiar de",
                required: true,
                placeholder:
                  sourceOptions.length === 0
                    ? "Nenhuma tabela existente"
                    : "Selecione a tabela de origem",
                options: sourceOptions,
              },
              {
                name: "name",
                type: "text",
                label: "Nome da nova tabela",
                required: true,
                placeholder: "Ex: Tabela 2027",
              },
              {
                name: "region",
                type: "text",
                label: "Região (opcional)",
                required: false,
                placeholder: "Vazio = herda a região da tabela de origem",
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
    [sourceOptions]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    const validUntil = toIsoDate(formData.validUntil);
    // Região vazia → null para o backend herdar a região da tabela de origem.
    const region = String(formData.region ?? "").trim();
    await execute(
      async () => {
        const res = await clonePriceList({
          variables: {
            input: {
              sourcePriceListId: extractValue(formData.sourcePriceListId),
              name: String(formData.name ?? "").trim(),
              region: region || null,
              validFrom: toIsoDate(formData.validFrom),
              validUntil: validUntil || null,
            },
          },
        });
        if (
          !res.data?.cloneFactoryPriceList?.status ||
          !res.data.cloneFactoryPriceList.data
        ) {
          throw new Error(
            res.data?.cloneFactoryPriceList?.message ?? "Erro ao clonar tabela"
          );
        }
        return res.data.cloneFactoryPriceList.data;
      },
      {
        successMessage: "Tabela criada a partir de outra (inativa)",
        onSuccess: (created) => {
          handleClose(false);
          onAddOptimistic(created);
          onCloned();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Copy} />
          <Button.Title>Partir de outra</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Criar a partir de outra tabela"
          description="Copia os produtos, níveis e preços da tabela escolhida. A nova tabela nasce inativa — ative quando quiser."
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
            <Button.Title>Criar cópia</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
