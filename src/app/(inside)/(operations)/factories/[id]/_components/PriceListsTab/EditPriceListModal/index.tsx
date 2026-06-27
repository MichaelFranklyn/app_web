"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { parseLocalDate, toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { UPDATE_FACTORY_PRICE_LIST_MUTATION } from "../gql";
import { extractSelectValue } from "@/utils/form";

interface PriceListNode {
  __typename?: "FactoryPriceListType";
  id: string;
  name: string;
  region: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

interface UpdatePriceListResponse {
  updateFactoryPriceList: {
    __typename?: "FactoryPriceListTypeDataResponse";
    status: boolean;
    message: string;
    data: PriceListNode | null;
  };
}

interface Props {
  priceList: PriceListNode;
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: Partial<PriceListNode>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

const ACTIVE_OPTIONS = [
  { value: "true", label: "Ativa" },
  { value: "false", label: "Inativa" },
];

export function EditPriceListModal({
  priceList,
  onChanged,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updatePriceList] = useMutation<UpdatePriceListResponse>(
    UPDATE_FACTORY_PRICE_LIST_MUTATION
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
              {
                name: "isActive",
                type: "select-single",
                label: "Status",
                required: true,
                options: ACTIVE_OPTIONS,
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(
    () => ({
      name: priceList.name,
      region: priceList.region,
      validFrom: parseLocalDate(priceList.validFrom),
      validUntil: parseLocalDate(priceList.validUntil),
      isActive:
        ACTIVE_OPTIONS.find(
          (o) => o.value === (priceList.isActive ? "true" : "false")
        ) ?? null,
    }),
    [priceList]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input: Record<string, unknown> = {};

    const name = String(data.name ?? "").trim();
    if (name && name !== priceList.name) input.name = name;

    const region = String(data.region ?? "").trim();
    if (region !== priceList.region) input.region = region;

    const validFrom = toIsoDate(data.validFrom);
    if (validFrom && validFrom !== toIsoDate(priceList.validFrom))
      input.validFrom = validFrom;

    const validUntil = toIsoDate(data.validUntil);
    if (validUntil !== toIsoDate(priceList.validUntil))
      input.validUntil = validUntil || null;

    const isActive = extractSelectValue(data.isActive) === "true";
    if (isActive !== priceList.isActive) input.isActive = isActive;

    if (Object.keys(input).length === 0) {
      setOpen(false);
      return;
    }

    setOpen(false);
    // A linha editada reflete na hora; o refetch (onChanged) ressincroniza
    // (ex.: ativar uma tabela desativa as demais no back).
    onUpdateOptimistic(priceList.id, {
      name: (input.name as string) ?? priceList.name,
      region: "region" in input ? (input.region as string) : priceList.region,
      validFrom: (input.validFrom as string) ?? priceList.validFrom,
      validUntil:
        "validUntil" in input
          ? (input.validUntil as string | null)
          : priceList.validUntil,
      isActive:
        "isActive" in input ? (input.isActive as boolean) : priceList.isActive,
    });

    await execute(
      async () => {
        const res = await updatePriceList({
          variables: { id: priceList.id, input },
        });
        if (
          !res.data?.updateFactoryPriceList?.status ||
          !res.data.updateFactoryPriceList.data
        ) {
          throw new Error(
            res.data?.updateFactoryPriceList?.message ??
              "Erro ao atualizar tabela de preço"
          );
        }
        return res.data.updateFactoryPriceList.data;
      },
      {
        successMessage: "Tabela de preço atualizada com sucesso",
        onSuccess: () => {
          onCommit();
          onChanged();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="sm" isIconOnly>
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar tabela de preço"
          description={`Altere os dados de "${priceList.name}".`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
