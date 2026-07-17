import { useEffect, useMemo, useRef, useState } from "react";

import { SelectOption } from "@/components/Input";
import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";

import {
  isQuantityMultiple,
  priceKey,
  resolveTierForProduct,
  useOrderItemCatalog,
} from "../orderItemCatalog";
import { DiscountType, DraftItem } from "./interface";
import { discountToAmount } from "./utils";

const toCurrencyMask = (value: number): string =>
  maskCurrency(value.toFixed(2));

/**
 * Gerencia o rascunho de itens do passo 2 do wizard: carrega o catálogo da
 * fábrica escolhida no passo 1, sugere o preço da tabela ativa (de forma
 * reativa, tolerante à ordem de carregamento das queries) e acumula os itens
 * em memória até o pedido ser criado.
 *
 * `clientId` é opcional só para não quebrar chamadas antigas — sem ele o nível
 * acordado no vínculo não é usado e o preço volta a depender de o vendedor
 * escolher o nível na mão.
 */
export function useOrderDraftItems(
  open: boolean,
  factoryId: string,
  clientId?: string | null
) {
  const {
    productOptions,
    tierOptions,
    ipiInOrder,
    priceMap,
    unitNameByProduct,
    saleMultipleByProduct,
    ipiRateByProduct,
    pricedTiersByProduct,
    linkedTierId,
  } = useOrderItemCatalog(open, factoryId || null, clientId);

  const [items, setItems] = useState<DraftItem[]>([]);
  const [productId, setProductId] = useState("");
  const [tierId, setTierId] = useState("");
  const [unitPrice, setUnitPrice] = useState(""); // mascarado ("32,50")
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("VALUE");
  const [ipiRate, setIpiRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Índice do item em edição; null = formulário está adicionando um item novo.
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Última combinação produto+nível já sugerida — não sobrescreve ajuste manual.
  const lastSuggestedRef = useRef<string>("");
  // Produtos cujo nível e IPI já foram resolvidos — resolver uma vez por
  // produto deixa o vendedor trocar o nível na mão sem ser corrigido de volta.
  const tierResolvedForRef = useRef<string>("");
  const ipiFilledForRef = useRef<string>("");

  // Escolhe o nível assim que o produto é selecionado (herda do item anterior,
  // cai no nível do vínculo ou no único nível com preço). Reativo: o catálogo
  // são 5 queries encadeadas e a tabela costuma chegar depois da seleção.
  useEffect(() => {
    if (!productId) return;
    const pricedTiers = pricedTiersByProduct.get(productId) ?? [];
    if (pricedTiers.length === 0) return; // tabela ainda não carregou
    if (tierResolvedForRef.current === productId) return;
    tierResolvedForRef.current = productId;
    const next = resolveTierForProduct(tierId, linkedTierId, pricedTiers);
    if (next !== tierId) setTierId(next);
  }, [productId, tierId, pricedTiersByProduct, linkedTierId]);

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

  // O IPI é atributo do produto (import da tabela, modelo de pedido ou cadastro
  // manual): ao selecionar o produto a alíquota vem junto, e o vendedor ajusta
  // se precisar. Produto sem IPI zera o campo — senão herdaria o do anterior.
  useEffect(() => {
    if (!productId || !ipiInOrder) return;
    if (productOptions.length === 0) return; // catálogo ainda não carregou
    if (ipiFilledForRef.current === productId) return;
    ipiFilledForRef.current = productId;
    const rate = ipiRateByProduct.get(productId);
    setIpiRate(rate == null ? "" : String(rate));
  }, [productId, ipiInOrder, ipiRateByProduct, productOptions.length]);

  const unitName = productId
    ? (unitNameByProduct.get(productId) ?? null)
    : null;
  // Múltiplo de venda já em unidades (peças).
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

  // Produto escolhido, nível escolhido e ainda assim sem preço na tabela ativa:
  // avisa em vez de deixar o campo vazio sem explicação.
  const priceMissing = Boolean(
    productId && tierId && priceMap.get(priceKey(productId, tierId)) == null
  );

  const resetNewItem = () => {
    setProductId("");
    setUnitPrice("");
    setQuantity("");
    setDiscount("");
    setDiscountType("VALUE");
    setIpiRate("");
    setEditingIndex(null);
    lastSuggestedRef.current = "";
    tierResolvedForRef.current = "";
    ipiFilledForRef.current = "";
    // `tierId` sobrevive de propósito: o próximo item do pedido costuma ser do
    // mesmo nível comercial, e trocá-lo a cada item era o que deixava o preço
    // em branco.
  };

  const selectProduct = (opt: SelectOption | SelectOption[] | null) => {
    const value = Array.isArray(opt) ? "" : (opt?.value ?? "");
    setProductId(value);
    // O preço é do produto+nível anterior: some até o novo ser sugerido.
    setUnitPrice("");
    lastSuggestedRef.current = "";
    setError(null);
  };

  const selectTier = (opt: SelectOption | SelectOption[] | null) => {
    setTierId(Array.isArray(opt) ? "" : (opt?.value ?? ""));
  };

  const selectDiscountType = (opt: SelectOption | SelectOption[] | null) => {
    const value = Array.isArray(opt) ? "" : (opt?.value ?? "");
    setDiscountType(value === "PERCENT" ? "PERCENT" : "VALUE");
  };

  /** Adiciona o item novo, ou salva o que está em edição. */
  const submitItem = () => {
    const price = parseMoneyToNumber(unitPrice);
    const qty = Number(quantity);
    if (!productId) return setError("Selecione o produto.");
    if (!price || price <= 0) return setError("Informe um preço válido.");
    if (!qty || qty <= 0) return setError("Informe uma quantidade válida.");
    if (saleMultiple && !isQuantityMultiple(qty, saleMultiple)) {
      return setError(
        `Este produto é vendido em múltiplos de ${saleMultiple} unidade(s).`
      );
    }
    // O mesmo produto duas vezes no pedido é sempre engano — quantidade a mais
    // se resolve editando o item que já está na lista.
    const duplicate = items.some(
      (item, index) => item.productId === productId && index !== editingIndex
    );
    if (duplicate) {
      return setError(
        "Este produto já está no pedido. Edite o item da lista para mudar a quantidade."
      );
    }
    const rawDiscount = Number(discount) || 0;
    if (discountType === "PERCENT" && rawDiscount > 100) {
      return setError("O desconto em porcentagem não pode passar de 100%.");
    }
    const discountAmount = discountToAmount(
      rawDiscount,
      discountType,
      price,
      qty
    );
    if (discountAmount > price * qty) {
      return setError("O desconto não pode ser maior que o valor do item.");
    }

    const item: DraftItem = {
      productId,
      productLabel: selectedProduct?.label ?? "",
      tierId,
      tierLabel: selectedTier?.label ?? "",
      unitPrice: price,
      quantity: qty,
      discount: discountAmount,
      discountInput: rawDiscount,
      discountType,
      ipiRate: ipiInOrder ? Number(ipiRate) || 0 : 0,
    };

    setItems((prev) =>
      editingIndex === null
        ? [...prev, item]
        : prev.map((old, index) => (index === editingIndex ? item : old))
    );
    resetNewItem();
    setError(null);
  };

  /** Carrega um item já adicionado de volta no formulário para ajuste. */
  const startEdit = (index: number) => {
    const item = items[index];
    if (!item) return;
    setEditingIndex(index);
    setProductId(item.productId);
    setTierId(item.tierId);
    setUnitPrice(toCurrencyMask(item.unitPrice));
    setQuantity(String(item.quantity));
    setDiscount(item.discountInput ? String(item.discountInput) : "");
    setDiscountType(item.discountType);
    setIpiRate(item.ipiRate ? String(item.ipiRate) : "");
    setError(null);
    // O item volta com os valores que o vendedor gravou: nenhum efeito deve
    // re-sugerir preço, nível ou IPI por cima deles.
    lastSuggestedRef.current = priceKey(item.productId, item.tierId);
    tierResolvedForRef.current = item.productId;
    ipiFilledForRef.current = item.productId;
  };

  const cancelEdit = () => {
    resetNewItem();
    setError(null);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    // O formulário está editando justamente este item (ou um que desceu uma
    // posição): sair da edição evita salvar por cima do item errado.
    if (editingIndex !== null && editingIndex >= index) resetNewItem();
  };

  const reset = () => {
    setItems([]);
    setTierId("");
    resetNewItem();
    setError(null);
  };

  return {
    productOptions,
    tierOptions,
    hasCatalog: productOptions.length > 0,
    ipiInOrder,
    unitName,
    saleMultiple,
    priceMissing,
    items,
    selectedProduct,
    selectedTier,
    unitPrice,
    quantity,
    discount,
    discountType,
    ipiRate,
    error,
    editingIndex,
    selectProduct,
    selectTier,
    selectDiscountType,
    setUnitPrice,
    setQuantity,
    setDiscount,
    setIpiRate,
    submitItem,
    startEdit,
    cancelEdit,
    removeItem,
    reset,
  };
}

export type OrderDraftItems = ReturnType<typeof useOrderDraftItems>;
