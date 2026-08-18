"use client";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  CREATE_PRICE_LIST_ITEM_MUTATION,
  PRODUCTS_OPTIONS_QUERY,
  TIERS_OPTIONS_QUERY,
} from "./gql";
import { extractSelectValue } from "@/utils/form";
import {
  CreateItemResponse,
  ProductOptionNode,
  ProductsData,
  TiersData,
} from "./interface";

type Option = SelectOption;

const PRODUCT_ORDER = { by: "name", dir: "asc" } as const;

// Referências estáveis: o hook de busca as usa em dependências de memo.
const getProductsConnection = (d: ProductsData) => d.products;
const toProductOption = (n: ProductOptionNode) => ({
  value: n.id,
  label: `${n.name} (${n.sku})`,
});

interface Props {
  priceListId: string;
  companyFactoryId: string;
  onAdded: () => void;
}

export function AddItemModal({
  priceListId,
  companyFactoryId,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  // Embalagem do produto selecionado, para nomear o campo de preço.
  const [packLabel, setPackLabel] = useState<string | null>(null);
  const formRef = useRef<FormBuilderRef>(null);

  // O catálogo de uma fábrica passa de 600 produtos: buscar uma página fixa
  // deixava de fora tudo o que não coubesse nela — e o produto ausente parecia
  // não estar cadastrado. A busca vai ao servidor, por nome ou código.
  const productScope = useMemo(
    () => [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
    [companyFactoryId]
  );

  const {
    options: productOptions,
    nodes: productNodes,
    loading: loadingProducts,
    onSearch: onProductSearch,
  } = useAsyncSelectOptions<ProductsData, ProductOptionNode>({
    query: PRODUCTS_OPTIONS_QUERY,
    getConnection: getProductsConnection,
    toOption: toProductOption,
    searchField: "name,sku",
    baseFilters: productScope,
    // Alfabética e larga o bastante para uma busca por código caber inteira na
    // primeira página (o código "150" casa com 27 produtos).
    order: PRODUCT_ORDER,
    first: 50,
    skip: !open || !companyFactoryId,
  });

  const { data: tiersData, error: tiersError } = useQuery<TiersData>(
    TIERS_OPTIONS_QUERY,
    {
      variables: {
        input: {
          first: 200,
          filters: [
            {
              field: "company_factory_id",
              operator: "eq",
              value: companyFactoryId,
            },
          ],
        },
      },
      skip: !open || !companyFactoryId,
    }
  );

  const [createItem] = useMutation<CreateItemResponse>(
    CREATE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Só a página atual da busca; basta, porque o rótulo é lido no clique — o
  // produto escolhido está sempre entre os que estão à vista.
  const packLabelByProduct = useMemo(() => {
    const map = new Map<string, string>();
    productNodes.forEach((node) => {
      if (node.unitLabel) map.set(node.id, node.unitLabel.label);
    });
    return map;
  }, [productNodes]);

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
                // Com a busca no servidor, lista vazia quer dizer "nada casa com
                // o que você digitou" — não "a fábrica não tem catálogo".
                placeholder: "Busque pelo nome ou código",
                options: productOptions,
                onSearch: onProductSearch,
                loading: loadingProducts,
                onChange: (value) => {
                  setPackLabel(
                    packLabelByProduct.get(extractSelectValue(value)) ?? null
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
                label: packLabel
                  ? `Preço por ${packLabel}`
                  : "Preço por embalagem",
                required: true,
                placeholder: "0,00",
                hint: "Preço da embalagem fechada. O valor com imposto é calculado a partir dos impostos do produto.",
              },
            ],
          },
        ],
      },
    ],
    [
      productOptions,
      onProductSearch,
      loadingProducts,
      tierOptions,
      packLabelByProduct,
      packLabel,
    ]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setPackLabel(null);
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const productId = extractSelectValue(data.productId);
    const tierId = extractSelectValue(data.tierId);

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

  useQueryErrorToast(
    tiersError,
    "Não foi possível carregar as opções. Tente novamente."
  );

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
