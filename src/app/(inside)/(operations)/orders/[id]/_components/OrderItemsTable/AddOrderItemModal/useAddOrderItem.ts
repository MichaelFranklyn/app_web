import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { OrderItem } from "../../../interface";
import { CREATE_ORDER_ITEM_MUTATION } from "../gql";
import { CreateOrderItemResponse } from "./interface";
import { useOrderItemCatalog } from "./useOrderItemCatalog";
import { priceKey } from "./utils";

export interface AddOrderItemModalProps {
  orderId: string;
  factoryId: string | null;
  /** Insere o item (já confirmado pelo servidor) na lista. */
  onAdded: (item: OrderItem) => void;
  /** Re-sincroniza com o servidor após sucesso. */
  onRefetch: () => void;
}

// Converte um número em máscara de moeda BRL ("12,50") para preencher o campo.
const toCurrencyMask = (value: number): string =>
  maskCurrency(value.toFixed(2));

export function useAddOrderItem({
  orderId,
  factoryId,
  onAdded,
  onRefetch,
}: AddOrderItemModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  // Produto selecionado no momento, para resolver o preço quando o nível muda.
  const selectedProductRef = useRef<string>("");
  // Embalagem do produto selecionado, para nomear preço e quantidade.
  const [packLabel, setPackLabel] = useState<string | null>(null);

  const {
    productOptions,
    tierOptions,
    priceMap,
    packLabelByProduct,
    saleMultipleByProduct,
  } = useOrderItemCatalog(open, factoryId);

  const saleMultiple = saleMultipleByProduct.get(selectedProductRef.current);

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
                    ? "Nenhum produto cadastrado nesta fábrica"
                    : "Digite o nome ou o código do produto",
                options: productOptions,
                onChange: (_value, setValue) => {
                  selectedProductRef.current = extractSelectValue(_value);
                  setPackLabel(
                    packLabelByProduct.get(selectedProductRef.current) ?? null
                  );
                  setValue("tierId", "");
                },
              },
              {
                name: "tierId",
                type: "select-single",
                label: "Nível comercial (opcional)",
                placeholder: "Selecione o nível para sugerir o preço",
                options: tierOptions,
                onChange: (_value, setValue) => {
                  const tierId = extractSelectValue(_value);
                  const price = priceMap.get(
                    priceKey(selectedProductRef.current, tierId)
                  );
                  // Sugere o preço da tabela; o vendedor pode ajustar.
                  if (price != null)
                    setValue("unitPrice", toCurrencyMask(price));
                },
              },
              {
                name: "unitPrice",
                type: "currency",
                label: packLabel
                  ? `Preço por ${packLabel}`
                  : "Preço por embalagem",
                required: true,
                placeholder: "0,00",
                hint: "Sugerido pela tabela ativa quando há nível. Você pode ajustar o valor.",
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

  const [createOrderItem] = useMutation<CreateOrderItemResponse>(
    CREATE_ORDER_ITEM_MUTATION
  );
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
    const productId = extractSelectValue(data.productId);
    const tierId = extractSelectValue(data.tierId);
    const quantity = Number(data.quantity);
    const discount = Number(data.discount ?? 0) || 0;
    const unitPrice = parseMoneyToNumber(String(data.unitPrice ?? ""));

    if (!productId) {
      throw new Error("Selecione o produto.");
    }
    if (!unitPrice || unitPrice <= 0) {
      throw new Error("Informe um preço válido para o item.");
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
              tierId: tierId || null,
              quantity,
              unitPrice,
              discount,
              source: "MANUAL",
            },
          },
        });
        if (
          !res.data?.createOrderItem?.status ||
          !res.data.createOrderItem.data
        ) {
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

  return {
    open,
    handleClose,
    formRef,
    steps,
    handleSubmit,
    isLoading,
  };
}
