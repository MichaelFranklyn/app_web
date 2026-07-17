import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isQuantityMultiple,
  priceKey,
  resolveTierForProduct,
  useOrderItemCatalog,
} from "../../../../../_shared/orderItemCatalog";
import {
  DISCOUNT_TYPE_OPTIONS,
  discountToAmount,
  DiscountType,
} from "../../../../../_shared/orderDraftItems";
import { OrderItem } from "../../../interface";
import { CREATE_ORDER_ITEM_MUTATION } from "../gql";
import { CreateOrderItemResponse } from "./interface";

export interface AddOrderItemModalProps {
  orderId: string;
  factoryId: string | null;
  /** Cliente do pedido: define o nível acordado que sugere o preço. */
  clientId?: string | null;
  /** Fábrica cobra IPI no pedido: exibe o campo de alíquota por item. */
  ipiInOrder?: boolean;
  /** Produtos já no pedido — o mesmo produto não entra duas vezes. */
  existingProductIds?: string[];
  /**
   * Nível do último item do pedido. O modal abre nele, como o wizard mantém o
   * nível entre itens: o pedido inteiro costuma sair no mesmo nível comercial.
   */
  lastTierId?: string | null;
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
  clientId,
  ipiInOrder = false,
  existingProductIds = [],
  lastTierId,
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
  // Produtos cujo nível e IPI já foram resolvidos: uma vez por produto, para
  // não corrigir de volta o que o vendedor escolher na mão.
  const tierResolvedForRef = useRef<string>("");
  const ipiFilledForRef = useRef<string>("");
  // Unidade de medida do produto selecionado (ex.: "Peça"), para nomear o preço.
  const [unitName, setUnitName] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>("VALUE");

  const {
    productOptions,
    tierOptions,
    priceMap,
    unitNameByProduct,
    saleMultipleByProduct,
    ipiRateByProduct,
    pricedTiersByProduct,
    linkedTierId,
  } = useOrderItemCatalog(open, factoryId, clientId);

  const saleMultiple = saleMultipleByProduct.get(selection.productId);

  // Escolhe o nível assim que o produto é selecionado: o do último item do
  // pedido, o acordado com o cliente, ou o único nível com preço — sem isso o
  // preço só aparece se o vendedor mexer no nível a cada item. Reativo: a
  // tabela chega depois.
  useEffect(() => {
    const { productId, tierId } = selection;
    if (!productId) return;
    const pricedTiers = pricedTiersByProduct.get(productId) ?? [];
    if (pricedTiers.length === 0) return; // tabela ainda não carregou
    if (tierResolvedForRef.current === productId) return;
    tierResolvedForRef.current = productId;
    // Cada abertura do modal é um item novo, então não há nível "em uso" como
    // no wizard: o do último item do pedido faz esse papel.
    const next = resolveTierForProduct(
      tierId || lastTierId || "",
      linkedTierId,
      pricedTiers
    );
    if (next === tierId) return;
    setSelection((s) => ({ ...s, tierId: next }));
    formRef.current?.setValue("tierId", next);
  }, [selection, pricedTiersByProduct, linkedTierId, lastTierId]);

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

  // O IPI é atributo do produto: ao selecionar o produto a alíquota cadastrada
  // vem junto (editável). Produto sem IPI zera o campo.
  useEffect(() => {
    const { productId } = selection;
    if (!productId || !ipiInOrder) return;
    if (productOptions.length === 0) return; // catálogo ainda não carregou
    if (ipiFilledForRef.current === productId) return;
    ipiFilledForRef.current = productId;
    const rate = ipiRateByProduct.get(productId);
    formRef.current?.setValue("ipiRate", rate == null ? "" : String(rate));
  }, [selection, ipiInOrder, ipiRateByProduct, productOptions.length]);

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
                  // O nível é mantido: quase sempre é o mesmo do item anterior,
                  // e o efeito acima o corrige se não servir a este produto.
                  setSelection((s) => ({ ...s, productId }));
                  setUnitName(unitNameByProduct.get(productId) ?? null);
                  lastSuggestedRef.current = "";
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
                label: unitName
                  ? `Preço por ${unitName.toLowerCase()}`
                  : "Preço por unidade",
                required: true,
                placeholder: "0,00",
                hint: "Preço de uma unidade, sugerido pela tabela ativa quando há nível. Você pode ajustar o valor.",
              },
              {
                name: "quantity",
                type: "number",
                label: "Quantidade",
                required: true,
                placeholder: "0",
                hint: [
                  "Em unidades (peças), não em embalagens.",
                  saleMultiple
                    ? `Vendido em múltiplos de ${saleMultiple}.`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" "),
              },
              {
                name: "discountType",
                type: "select-single",
                label: "Tipo de desconto",
                // Sem escolha, o desconto é em reais — o placeholder diz isso
                // em vez de deixar o campo em branco.
                placeholder: "R$ (valor)",
                options: DISCOUNT_TYPE_OPTIONS,
                onChange: (_value) => {
                  setDiscountType(
                    extractSelectValue(_value) === "PERCENT"
                      ? "PERCENT"
                      : "VALUE"
                  );
                },
              },
              {
                name: "discount",
                type: "number",
                label:
                  discountType === "PERCENT" ? "Desconto (%)" : "Desconto (R$)",
                placeholder: "0",
              },
              ...(ipiInOrder
                ? [
                    {
                      name: "ipiRate",
                      type: "number" as const,
                      label: "Alíq. IPI (%)",
                      placeholder: "0",
                      hint: "Vem do IPI cadastrado no produto e é somado por cima do subtotal. Você pode ajustar.",
                    },
                  ]
                : []),
            ],
          },
        ],
      },
    ],
    [
      productOptions,
      tierOptions,
      unitNameByProduct,
      unitName,
      saleMultiple,
      ipiInOrder,
      discountType,
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
      setSelection({ productId: "", tierId: "" });
      lastSuggestedRef.current = "";
      tierResolvedForRef.current = "";
      ipiFilledForRef.current = "";
      setUnitName(null);
      setDiscountType("VALUE");
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const productId = extractSelectValue(data.productId);
    const tierId = extractSelectValue(data.tierId);
    const quantity = Number(data.quantity);
    const rawDiscount = Number(data.discount ?? 0) || 0;
    const ipiRate = ipiInOrder ? Number(data.ipiRate ?? 0) || 0 : 0;
    const unitPrice = parseMoneyToNumber(String(data.unitPrice ?? ""));

    if (!productId) {
      throw new Error("Selecione o produto.");
    }
    if (existingProductIds.includes(productId)) {
      throw new Error(
        "Este produto já está no pedido. Edite o item da lista para mudar a quantidade."
      );
    }
    if (!unitPrice || unitPrice <= 0) {
      throw new Error("Informe um preço válido para o item.");
    }
    if (!quantity || quantity <= 0) {
      throw new Error("Informe uma quantidade válida.");
    }
    const multiple = saleMultipleByProduct.get(productId);
    if (multiple && !isQuantityMultiple(quantity, multiple)) {
      throw new Error(
        `Este produto é vendido em múltiplos de ${multiple} unidade(s).`
      );
    }
    if (discountType === "PERCENT" && rawDiscount > 100) {
      throw new Error("O desconto em porcentagem não pode passar de 100%.");
    }
    // O backend só conhece desconto em reais: a porcentagem vira valor aqui.
    const discount = discountToAmount(
      rawDiscount,
      discountType,
      unitPrice,
      quantity
    );
    if (discount > unitPrice * quantity) {
      throw new Error("O desconto não pode ser maior que o valor do item.");
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
              ipiRate,
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
