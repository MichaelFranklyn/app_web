import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  priceKey,
  useOrderItemCatalog,
} from "../../../../_shared/orderItemCatalog";
import { OrderItem } from "../../../interface";
import { CREATE_ORDER_ITEM_MUTATION } from "../gql";
import { CreateOrderItemResponse } from "./interface";

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
  // Produto+nível selecionados. É estado (não ref) porque a sugestão de preço
  // é reativa: precisa reagir tanto à seleção quanto à chegada da tabela.
  const [selection, setSelection] = useState({ productId: "", tierId: "" });
  // Última combinação produto+nível já sugerida — evita sobrescrever um preço
  // que o vendedor ajustou manualmente na mesma combinação.
  const lastSuggestedRef = useRef<string>("");
  // Embalagem do produto selecionado, para nomear preço e quantidade.
  const [packLabel, setPackLabel] = useState<string | null>(null);

  const {
    productOptions,
    tierOptions,
    priceMap,
    packLabelByProduct,
    saleMultipleByProduct,
  } = useOrderItemCatalog(open, factoryId);

  const saleMultiple = saleMultipleByProduct.get(selection.productId);

  // Sugere o preço da tabela ativa de forma REATIVA: dispara quando o nível é
  // escolhido e também quando a tabela de preços termina de carregar (as 5
  // queries são encadeadas, então o `priceMap` costuma chegar depois da
  // seleção). Só sugere uma vez por combinação — depois disso o vendedor pode
  // ajustar o valor livremente sem que o preço volte a ser reescrito.
  useEffect(() => {
    const { productId, tierId } = selection;
    if (!productId || !tierId) return;
    const key = priceKey(productId, tierId);
    if (key === lastSuggestedRef.current) return;
    const price = priceMap.get(key);
    if (price == null) return; // tabela ainda não carregou (ou combinação sem preço)
    lastSuggestedRef.current = key;
    formRef.current?.setValue("unitPrice", toCurrencyMask(price));
  }, [selection, priceMap]);

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
                  const productId = extractSelectValue(_value);
                  // Troca de produto zera o nível e o preço: a combinação antiga
                  // não vale mais. O preço será re-sugerido ao escolher o nível.
                  setSelection({ productId, tierId: "" });
                  setPackLabel(packLabelByProduct.get(productId) ?? null);
                  lastSuggestedRef.current = "";
                  setValue("tierId", "");
                  setValue("unitPrice", "");
                },
              },
              {
                name: "tierId",
                type: "select-single",
                label: "Nível comercial (opcional)",
                placeholder: "Selecione o nível para sugerir o preço",
                options: tierOptions,
                onChange: (_value) => {
                  setSelection((s) => ({
                    ...s,
                    tierId: extractSelectValue(_value),
                  }));
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
    [productOptions, tierOptions, packLabelByProduct, packLabel, saleMultiple]
  );

  const [createOrderItem] = useMutation<CreateOrderItemResponse>(
    CREATE_ORDER_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setSelection({ productId: "", tierId: "" });
      lastSuggestedRef.current = "";
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
