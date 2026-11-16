"use client";

import { useCallback, useEffect, useState } from "react";
import { OrderableProduct, OrderCartItem } from "./interface";
import { cartStorageKey, parseStoredCart, toCartItem } from "./utils";

const EMPTY: OrderCartItem[] = [];

/**
 * A lista do cliente: o que ele já escolheu, em qualquer parte da tela.
 *
 * Fica no navegador (`sessionStorage`), e não no formulário de cada página,
 * porque a busca e a paginação do catálogo recarregam a página — sem isso,
 * buscar "torneira" apagaria o sifão que ele já tinha escolhido. A leitura é
 * depois de montar (o servidor não tem `sessionStorage`), e qualquer falha de
 * acesso (aba anônima, armazenamento bloqueado) só faz a lista não sobreviver
 * à troca de página.
 *
 * Uma lista por fábrica: o orçamento é de uma fábrica só. Ao trocar de
 * fábrica a chave muda, e a gravação espera a lista da nova chave ser lida —
 * senão a lista da fábrica anterior seria copiada para a nova.
 */
export function useOrderCart(token: string, factoryId: string | null) {
  // Sem fábrica escolhida não há lista: nada é lido nem gravado.
  const key = factoryId ? cartStorageKey(token, factoryId) : null;
  const [items, setItems] = useState<OrderCartItem[]>([]);
  const [restoredKey, setRestoredKey] = useState<string | null>(null);

  useEffect(() => {
    if (key === null) return;
    let stored: OrderCartItem[] = [];
    try {
      stored = parseStoredCart(window.sessionStorage.getItem(key));
    } catch {
      stored = [];
    }
    // Leitura única do armazenamento do navegador depois da hidratação.
    setItems(stored);
    setRestoredKey(key);
  }, [key]);

  useEffect(() => {
    if (key === null || restoredKey !== key) return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Sem armazenamento: a lista vale só enquanto a página estiver aberta.
    }
  }, [items, key, restoredKey]);

  const add = useCallback((product: OrderableProduct) => {
    setItems((current) =>
      current.some((item) => item.productId === product.productId)
        ? current
        : [...current, toCartItem(product)]
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId)
    );
  }, []);

  const setQuantity = useCallback((productId: string, quantity: string) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  // Até a lista da fábrica atual ser lida, a da anterior não aparece.
  const current = key !== null && restoredKey === key ? items : EMPTY;

  const has = useCallback(
    (productId: string) => current.some((item) => item.productId === productId),
    [current]
  );

  return { items: current, add, remove, setQuantity, clear, has };
}

/** O que a tela recebe do carrinho (repassado ao corpo do pedido). */
export type OrderCartApi = ReturnType<typeof useOrderCart>;
