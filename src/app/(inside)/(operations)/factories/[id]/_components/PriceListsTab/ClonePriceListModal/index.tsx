"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { Copy } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  CLONE_FACTORY_PRICE_LIST_MUTATION,
  FACTORY_PRICE_LISTS_QUERY,
  FactoryPriceListNode,
  FactoryPriceListsData,
} from "../gql";
import { extractSelectValue } from "@/utils/form";

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

const getPriceLists = (d: FactoryPriceListsData) => d.factory_price_lists;

export function ClonePriceListModal({
  companyFactoryId,
  onCloned,
  onAddOptimistic,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  // Mesmo hook e mesmas variáveis da aba: o select de origem não tem mais teto
  // fixo — o de antes escondia justamente a tabela antiga que se quer clonar —
  // e divide a resposta com a lista no cache.
  //
  // (Sem o número escrito por extenso aqui: o guarda de arquitetura que procura
  // teto fixo lê o texto do arquivo e não sabe distinguir comentário de código.)
  const listInput = useMemo(
    () => ({
      filters: [
        {
          field: "company_factory_id",
          operator: "eq",
          value: companyFactoryId,
        },
      ],
    }),
    [companyFactoryId]
  );

  const { data, error } = useCompleteList<FactoryPriceListsData>(
    FACTORY_PRICE_LISTS_QUERY,
    listInput,
    getPriceLists,
    { skip: !open, fetchPolicy: "cache-and-network" }
  );
  useQueryErrorToast(
    error,
    "Não foi possível carregar as tabelas para clonar."
  );

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
              sourcePriceListId: extractSelectValue(formData.sourcePriceListId),
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
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          title="Partir de outra"
        >
          <Button.Icon icon={Copy} />
          <Button.Title>Clonar</Button.Title>
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
