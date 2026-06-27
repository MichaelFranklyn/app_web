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
import { PriceListDetail } from "../../../interface";
import { UPDATE_FACTORY_PRICE_LIST_MUTATION } from "../gql";
import { extractSelectValue } from "@/utils/form";

interface UpdatePriceListResponse {
  updateFactoryPriceList: {
    __typename?: "FactoryPriceListTypeDataResponse";
    status: boolean;
    message: string;
    data: (PriceListDetail & { __typename?: "FactoryPriceListType" }) | null;
  };
}

interface Props {
  priceList: PriceListDetail;
  onChanged: () => void;
}

const ACTIVE_OPTIONS = [
  { value: "true", label: "Ativa" },
  { value: "false", label: "Inativa" },
];

export function EditPriceListModal({ priceList, onChanged }: Props) {
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
          setOpen(false);
          onChanged();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar tabela</Button.Title>
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
