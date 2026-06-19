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
  PRODUCTS_OPTIONS_QUERY,
  TIERS_OPTIONS_QUERY,
} from "./gql";

type Option = SelectOption;

interface ProductsData {
  products: {
    edges: {
      node: {
        id: string;
        name: string;
        sku: string;
        unitLabel: { id: string; label: string } | null;
      };
    }[];
  };
}
interface TiersData {
  priceTiers: { edges: { node: { id: string; name: string } }[] };
}
interface CreateItemResponse {
  createPriceListItem: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  priceListId: string;
  companyFactoryId: string;
  onAdded: () => void;
}

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function AddItemModal({
  priceListId,
  companyFactoryId,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  // Embalagem do produto selecionado, para nomear o campo de preço.
  const [packLabel, setPackLabel] = useState<string | null>(null);
  const formRef = useRef<FormBuilderRef>(null);

  const byCompanyFactory = {
    first: 200,
    filters: [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
  };

  const { data: productsData } = useQuery<ProductsData>(PRODUCTS_OPTIONS_QUERY, {
    variables: { input: byCompanyFactory },
    skip: !open || !companyFactoryId,
  });

  const { data: tiersData } = useQuery<TiersData>(TIERS_OPTIONS_QUERY, {
    variables: { input: byCompanyFactory },
    skip: !open || !companyFactoryId,
  });

  const [createItem] = useMutation<CreateItemResponse>(
    CREATE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const productOptions: Option[] = useMemo(
    () =>
      productsData?.products.edges.map((e) => ({
        value: e.node.id,
        label: `${e.node.name} (${e.node.sku})`,
      })) ?? [],
    [productsData]
  );

  const packLabelByProduct = useMemo(() => {
    const map = new Map<string, string>();
    productsData?.products.edges.forEach((e) => {
      if (e.node.unitLabel) map.set(e.node.id, e.node.unitLabel.label);
    });
    return map;
  }, [productsData]);

  const tierOptions: Option[] = useMemo(
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
                name: "productId",
                type: "select-single",
                label: "Produto",
                required: true,
                placeholder:
                  productOptions.length === 0
                    ? "Cadastre um produto primeiro"
                    : "Selecione o produto",
                options: productOptions,
                onChange: (value) => {
                  setPackLabel(
                    packLabelByProduct.get(extractValue(value)) ?? null
                  );
                },
              },
              {
                name: "tierId",
                type: "select-single",
                label: "Nível comercial",
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
                label: packLabel ? `Preço por ${packLabel}` : "Preço por embalagem",
                required: true,
                placeholder: "0,00",
                hint: "Preço da embalagem fechada. O valor com imposto é calculado a partir dos impostos do produto.",
              },
            ],
          },
        ],
      },
    ],
    [productOptions, tierOptions, packLabelByProduct, packLabel]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setPackLabel(null);
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const productId = extractValue(data.productId);
    const tierId = extractValue(data.tierId);

    await execute(
      async () => {
        const res = await createItem({
          variables: {
            input: {
              priceListId,
              productId,
              tierId,
              unitPrice: parseMoneyToNumber(String(data.unitPrice ?? "")),
            },
          },
        });
        if (!res.data?.createPriceListItem?.status) {
          throw new Error(
            res.data?.createPriceListItem?.message ?? "Erro ao cadastrar preço"
          );
        }
        return res.data.createPriceListItem;
      },
      {
        successMessage: "Item de preço cadastrado",
        onSuccess: async () => {
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
          <Button.Title>Adicionar item</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Adicionar item à tabela"
          description="Vincule um produto e nível comercial a esta tabela com o preço da embalagem."
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
            <Button.Title>Cadastrar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
