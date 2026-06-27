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
import { parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  CREATE_PRICE_LIST_ITEM_MUTATION,
  FACTORY_PRICE_LISTS_OPTIONS_QUERY,
  PRICE_TIERS_OPTIONS_QUERY,
} from "../gql";
import { extractSelectValue } from "@/utils/form";
import { CreateItemResponse, PriceListsData, TiersData } from "./interface";

interface Props {
  productId: string;
  companyFactoryId: string;
  /** Embalagem do produto (ex.: "Caixa"), para nomear o campo de preço. */
  packLabel: string;
  onAdded: () => void;
}

export function AddPriceItemModal({
  productId,
  companyFactoryId,
  packLabel,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const byCompanyFactory = {
    first: 200,
    filters: [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
  };

  const { data: listsData } = useQuery<PriceListsData>(
    FACTORY_PRICE_LISTS_OPTIONS_QUERY,
    { variables: { input: byCompanyFactory }, skip: !open || !companyFactoryId }
  );

  const { data: tiersData } = useQuery<TiersData>(PRICE_TIERS_OPTIONS_QUERY, {
    variables: { input: byCompanyFactory },
    skip: !open || !companyFactoryId,
  });

  const [createItem] = useMutation<CreateItemResponse>(
    CREATE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const listOptions: SelectOption[] = useMemo(
    () =>
      listsData?.factoryPriceLists.edges.map((e) => ({
        value: e.node.id,
        label: e.node.isActive ? `${e.node.name} (ativa)` : e.node.name,
      })) ?? [],
    [listsData]
  );

  const tierOptions: SelectOption[] = useMemo(
    () =>
      tiersData?.priceTiers.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [tiersData]
  );

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "item",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "priceListId",
                type: "select-single",
                label: "Tabela de preço",
                required: true,
                placeholder:
                  listOptions.length === 0
                    ? "Cadastre uma tabela primeiro"
                    : "Selecione a tabela",
                options: listOptions,
              },
              {
                name: "tierId",
                type: "select-single",
                label: "Nível",
                required: true,
                placeholder:
                  tierOptions.length === 0
                    ? "Cadastre um nível primeiro"
                    : "Selecione o nível",
                options: tierOptions,
              },
              {
                name: "unitPrice",
                type: "currency",
                label: `Preço por ${packLabel}`,
                required: true,
                placeholder: "0,00",
                hint: "Preço da embalagem fechada. O valor com imposto é calculado a partir dos impostos do produto.",
              },
            ],
          },
        ],
      },
    ],
    [listOptions, tierOptions, packLabel]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const priceListId = extractSelectValue(data.priceListId);
    const tierId = extractSelectValue(data.tierId);
    const unitPrice = parseMoneyToNumber(String(data.unitPrice ?? ""));

    await execute(
      async () => {
        const res = await createItem({
          variables: {
            input: { priceListId, productId, tierId, unitPrice },
          },
        });
        if (!res.data?.createPriceListItem?.status) {
          throw new Error(
            res.data?.createPriceListItem?.message ?? "Erro ao adicionar preço"
          );
        }
        return res.data.createPriceListItem;
      },
      {
        successMessage: "Preço adicionado com sucesso",
        onSuccess: () => {
          handleClose(false);
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
          <Button.Title>Adicionar preço</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Adicionar preço"
          description={`Defina o preço por ${packLabel} deste produto em uma tabela de preço existente.`}
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
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
