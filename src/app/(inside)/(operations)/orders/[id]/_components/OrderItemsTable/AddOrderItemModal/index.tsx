"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatMoney } from "@/utils/format/masks";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { OrderItem } from "../../../interface";
import {
  CREATE_ORDER_ITEM_MUTATION,
  ORDER_ITEM_COMPANY_FACTORIES_QUERY,
  ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
  ORDER_ITEM_PRICE_LISTS_QUERY,
} from "../gql";

interface CompanyFactoriesData {
  companyFactories: {
    edges: { node: { id: string; factoryId: string } }[];
  };
}

interface PriceListsData {
  factoryPriceLists: {
    edges: {
      node: {
        id: string;
        name: string;
        isActive: boolean;
        validFrom: string;
        validUntil: string | null;
      };
    }[];
  };
}

interface PriceListItemsData {
  priceListItems: {
    edges: {
      node: {
        id: string;
        unitPrice: string;
        product: {
          id: string;
          name: string;
          sku: string;
          saleMultiple: string | null;
          unitLabel: { id: string; label: string } | null;
        } | null;
        tier: { id: string; name: string } | null;
      };
    }[];
  };
}

interface CreateOrderItemResponse {
  createOrderItem: {
    status: boolean;
    message: string;
    data: OrderItem | null;
  };
}

interface Props {
  orderId: string;
  factoryId: string | null;
  /** Insere o item (já confirmado pelo servidor) na lista. */
  onAdded: (item: OrderItem) => void;
  /** Re-sincroniza com o servidor após sucesso. */
  onRefetch: () => void;
}

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

const priceKey = (productId: string, tierId: string) =>
  `${productId}:${tierId}`;

export function AddOrderItemModal({
  orderId,
  factoryId,
  onAdded,
  onRefetch,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  // Produto selecionado no momento, para resolver o preço quando o nível muda.
  const selectedProductRef = useRef<string>("");
  // Embalagem do produto selecionado, para nomear preço e quantidade.
  const [packLabel, setPackLabel] = useState<string | null>(null);

  // 1) Localiza o company_factory da fábrica deste pedido.
  const { data: cfData } = useQuery<CompanyFactoriesData>(
    ORDER_ITEM_COMPANY_FACTORIES_QUERY,
    {
      variables: { input: { first: 200 } },
      skip: !open || !factoryId,
    }
  );

  const companyFactoryId = useMemo(
    () =>
      cfData?.companyFactories.edges.find((e) => e.node.factoryId === factoryId)
        ?.node.id ?? null,
    [cfData, factoryId]
  );

  // 2) Tabelas de preço do vínculo — escolhemos a ativa.
  const { data: priceListsData } = useQuery<PriceListsData>(
    ORDER_ITEM_PRICE_LISTS_QUERY,
    {
      variables: {
        input: {
          first: 100,
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

  const activePriceListId = useMemo(
    () =>
      priceListsData?.factoryPriceLists.edges.find((e) => e.node.isActive)?.node
        .id ?? null,
    [priceListsData]
  );

  // 3) Itens da tabela ativa — produto/nível/preço.
  const { data: itemsData } = useQuery<PriceListItemsData>(
    ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
    {
      variables: {
        input: {
          first: 500,
          filters: [
            {
              field: "price_list_id",
              operator: "eq",
              value: activePriceListId,
            },
          ],
        },
      },
      skip: !open || !activePriceListId,
    }
  );

  const priceRows = useMemo(
    () =>
      (itemsData?.priceListItems.edges ?? [])
        .map((e) => e.node)
        .filter((n) => n.product && n.tier),
    [itemsData]
  );

  const productOptions = useMemo(() => {
    const map = new Map<string, string>();
    priceRows.forEach((n) => {
      // Inclui o código (SKU) no rótulo para que o vendedor possa digitar o
      // código e o select filtre por ele (busca por texto do label).
      if (n.product) {
        const label = n.product.sku
          ? `${n.product.sku} — ${n.product.name}`
          : n.product.name;
        map.set(n.product.id, label);
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [priceRows]);

  const tierOptions = useMemo(() => {
    const map = new Map<string, string>();
    priceRows.forEach((n) => {
      if (n.tier) map.set(n.tier.id, n.tier.name);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [priceRows]);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    priceRows.forEach((n) => {
      if (n.product && n.tier)
        map.set(priceKey(n.product.id, n.tier.id), parseFloat(n.unitPrice));
    });
    return map;
  }, [priceRows]);

  const packLabelByProduct = useMemo(() => {
    const map = new Map<string, string>();
    priceRows.forEach((n) => {
      if (n.product?.unitLabel) map.set(n.product.id, n.product.unitLabel.label);
    });
    return map;
  }, [priceRows]);

  const saleMultipleByProduct = useMemo(() => {
    const map = new Map<string, number>();
    priceRows.forEach((n) => {
      const multiple = Number(n.product?.saleMultiple);
      if (n.product && multiple > 0) map.set(n.product.id, multiple);
    });
    return map;
  }, [priceRows]);

  const saleMultiple = saleMultipleByProduct.get(selectedProductRef.current);

  const noPriceList = open && !!companyFactoryId && !activePriceListId;

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
                label: "Produto (nome ou código)",
                required: true,
                placeholder:
                  productOptions.length === 0
                    ? "Nenhum produto com preço na tabela ativa"
                    : "Digite o nome ou o código do produto",
                options: productOptions,
                onChange: (_value, setValue) => {
                  selectedProductRef.current = extractValue(_value);
                  setPackLabel(
                    packLabelByProduct.get(selectedProductRef.current) ?? null
                  );
                  setValue("tierId", "");
                  setValue("priceLabel", "");
                },
              },
              {
                name: "tierId",
                type: "select-single",
                label: "Nível comercial",
                required: true,
                placeholder: "Selecione o nível",
                options: tierOptions,
                onChange: (_value, setValue) => {
                  const tierId = extractValue(_value);
                  const price = priceMap.get(
                    priceKey(selectedProductRef.current, tierId)
                  );
                  setValue(
                    "priceLabel",
                    price != null
                      ? formatMoney(String(price))
                      : "Sem preço para esta combinação"
                  );
                },
              },
              {
                name: "priceLabel",
                type: "text",
                label: packLabel
                  ? `Preço por ${packLabel} (tabela ativa)`
                  : "Preço por embalagem (tabela ativa)",
                disabled: true,
                placeholder: "Selecione produto e nível",
              },
              {
                name: "quantity",
                type: "number",
                label: "Quantidade",
                required: true,
                placeholder: "0",
                hint: [
                  packLabel
                    ? `Em embalagens (${packLabel}).`
                    : "Em embalagens, não em unidades.",
                  saleMultiple
                    ? `Vendido em múltiplos de ${saleMultiple}.`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" "),
                grid: { mobile: 12, tablet: 6, desktop: 6 },
              },
              {
                name: "discount",
                type: "number",
                label: "Desconto (R$)",
                placeholder: "0",
                grid: { mobile: 12, tablet: 6, desktop: 6 },
              },
            ],
          },
        ],
      },
    ],
    [
      productOptions,
      tierOptions,
      priceMap,
      packLabelByProduct,
      packLabel,
      saleMultiple,
    ]
  );

  const [createOrderItem] =
    useMutation<CreateOrderItemResponse>(CREATE_ORDER_ITEM_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      selectedProductRef.current = "";
      setPackLabel(null);
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const productId = extractValue(data.productId);
    const tierId = extractValue(data.tierId);
    const quantity = Number(data.quantity);
    const discount = Number(data.discount ?? 0) || 0;
    const unitPrice = priceMap.get(priceKey(productId, tierId));

    if (!productId || !tierId) {
      throw new Error("Selecione o produto e o nível.");
    }
    if (unitPrice == null) {
      throw new Error(
        "Não há preço cadastrado para este produto/nível na tabela ativa."
      );
    }
    if (!quantity || quantity <= 0) {
      throw new Error("Informe uma quantidade válida.");
    }
    const multiple = saleMultipleByProduct.get(productId);
    if (multiple && quantity % multiple !== 0) {
      throw new Error(
        `Este produto é vendido em múltiplos de ${multiple} embalagem(ns).`
      );
    }

    // Espera a confirmação do servidor e só então insere o item (já com id e
    // subtotal reais) na lista.
    await execute(
      async () => {
        const res = await createOrderItem({
          variables: {
            input: {
              orderId,
              productId,
              tierId,
              quantity,
              unitPrice,
              discount,
              source: "MANUAL",
            },
          },
        });
        if (!res.data?.createOrderItem?.status || !res.data.createOrderItem.data) {
          throw new Error(
            res.data?.createOrderItem?.message ?? "Erro ao adicionar item"
          );
        }
        return res.data.createOrderItem.data;
      },
      {
        successMessage: "Item adicionado ao pedido",
        onSuccess: (created) => {
          onAdded(created);
          onRefetch();
          handleClose(false);
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
          title="Adicionar item ao pedido"
          description="O preço por embalagem é puxado automaticamente da tabela de preço ativa da fábrica."
        />

        <Modal.Body>
          {noPriceList ? (
            <Title variant="body-sm" color="muted">
              Esta fábrica não possui uma tabela de preço ativa. Cadastre uma
              tabela ativa para adicionar itens ao pedido.
            </Title>
          ) : (
            <FormBuilder
              ref={formRef}
              steps={steps}
              onSubmit={handleSubmit}
              loading={isLoading}
              unstyled
            />
          )}
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
            disabled={noPriceList}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
