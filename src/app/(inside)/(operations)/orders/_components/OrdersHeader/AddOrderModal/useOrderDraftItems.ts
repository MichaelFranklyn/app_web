import { useEffect, useMemo, useRef, useState } from "react";

import { SelectOption } from "@/components/Input";
import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";

import {
  priceKey,
  useOrderItemCatalog,
} from "../../../_shared/orderItemCatalog";
import { DraftItem } from "./interface";

const toCurrencyMask = (value: number): string =>
  maskCurrency(value.toFixed(2));

/**
 * Gerencia o rascunho de itens do passo 2 do wizard: carrega o catálogo da
 * fábrica escolhida no passo 1, sugere o preço da tabela ativa (de forma
 * reativa, tolerante à ordem de carregamento das queries) e acumula os itens
 * em memória até o pedido ser criado.
 */
export function useOrderDraftItems(open: boolean, factoryId: string) {
  const {
    productOptions,
    tierOptions,
    priceMap,
    packLabelByProduct,
    saleMultipleByProduct,
  } = useOrderItemCatalog(open, factoryId || null);

  const [items, setItems] = useState<DraftItem[]>([]);
  const [productId, setProductId] = useState("");
  const [tierId, setTierId] = useState("");
  const [unitPrice, setUnitPrice] = useState(""); // mascarado ("32,50")
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Última combinação produto+nível já sugerida — não sobrescreve ajuste manual.
  const lastSuggestedRef = useRef<string>("");

  // Sugere o preço quando o nível é escolhido e também quando a tabela termina
  // de carregar (mesma lógica reativa do modal de item do detalhe).
  useEffect(() => {
    if (!productId || !tierId) return;
    const key = priceKey(productId, tierId);
    if (key === lastSuggestedRef.current) return;
    const price = priceMap.get(key);
    if (price == null) return;
    lastSuggestedRef.current = key;
    setUnitPrice(toCurrencyMask(price));
  }, [productId, tierId, priceMap]);

  const packLabel = productId
    ? (packLabelByProduct.get(productId) ?? null)
    : null;
  const saleMultiple = productId
    ? saleMultipleByProduct.get(productId)
    : undefined;

  const selectedProduct = useMemo(
    () => productOptions.find((o) => o.value === productId) ?? null,
    [productOptions, productId]
  );
  const selectedTier = useMemo(
    () => tierOptions.find((o) => o.value === tierId) ?? null,
    [tierOptions, tierId]
  );

  const resetNewItem = () => {
    setProductId("");
    setTierId("");
    setUnitPrice("");
    setQuantity("");
    setDiscount("");
    lastSuggestedRef.current = "";
  };

  const selectProduct = (opt: SelectOption | SelectOption[] | null) => {
    const value = Array.isArray(opt) ? "" : (opt?.value ?? "");
    setProductId(value);
    // Trocar de produto zera o nível e o preço: a combinação antiga não vale.
    setTierId("");
    setUnitPrice("");
    lastSuggestedRef.current = "";
    setError(null);
  };

  const selectTier = (opt: SelectOption | SelectOption[] | null) => {
    setTierId(Array.isArray(opt) ? "" : (opt?.value ?? ""));
  };

  const addItem = () => {
    const price = parseMoneyToNumber(unitPrice);
    const qty = Number(quantity);
    const disc = Number(discount) || 0;
    if (!productId) return setError("Selecione o produto.");
    if (!price || price <= 0) return setError("Informe um preço válido.");
    if (!qty || qty <= 0) return setError("Informe uma quantidade válida.");
    if (saleMultiple && qty % saleMultiple !== 0) {
      return setError(
        `Este produto é vendido em múltiplos de ${saleMultiple} embalagem(ns).`
      );
    }
    setItems((prev) => [
      ...prev,
      {
        productId,
        productLabel: selectedProduct?.label ?? "",
        tierId,
        tierLabel: selectedTier?.label ?? "",
        unitPrice: price,
        quantity: qty,
        discount: disc,
      },
    ]);
    resetNewItem();
    setError(null);
  };

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    setItems([]);
    resetNewItem();
    setError(null);
  };

  return {
    productOptions,
    tierOptions,
    hasCatalog: productOptions.length > 0,
    packLabel,
    saleMultiple,
    items,
    selectedProduct,
    selectedTier,
    unitPrice,
    quantity,
    discount,
    error,
    selectProduct,
    selectTier,
    setUnitPrice,
    setQuantity,
    setDiscount,
    addItem,
    removeItem,
    reset,
  };
}

export type OrderDraftItems = ReturnType<typeof useOrderDraftItems>;
