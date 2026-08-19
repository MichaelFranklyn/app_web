"use client";

import { useCallback, useMemo, useState } from "react";

export interface ScopedSelection {
  /** Escopo dono da seleção atual (o cartão/tabela onde ela foi feita). */
  scopeId: string | null;
  /** Ids marcados, na ordem em que entraram. */
  ids: string[];
  count: number;
  /** Set do escopo pedido, ou `undefined` se a seleção é de outro escopo. */
  selectedIn: (scopeId: string) => Set<string> | undefined;
  toggle: (scopeId: string, id: string) => void;
  /** Marca todos os ids do escopo; se já estavam todos marcados, desmarca. */
  toggleAll: (scopeId: string, ids: string[]) => void;
  clear: () => void;
}

interface State {
  scopeId: string | null;
  ids: Set<string>;
}

const EMPTY: State = { scopeId: null, ids: new Set() };

/**
 * Seleção de linhas que vale em UM escopo por vez.
 *
 * Existe porque há telas em que o lote não pode misturar origens — na
 * conferência de comissões, por exemplo, a data de repasse é de uma fábrica só,
 * e um lote com duas fábricas seria marcado com a data errada. Manter um
 * `useState` por cartão resolveria o escopo, mas deixaria várias seleções vivas
 * ao mesmo tempo e, com elas, várias barras de ação disputando a tela.
 *
 * Aqui marcar no cartão B abandona o que estava marcado no A: a seleção é
 * sempre uma, e a barra que a acompanha também.
 *
 * @example
 * const selection = useScopedSelection();
 * <Tabela
 *   selectedIds={selection.selectedIn(fabrica.id)}
 *   onToggleRow={(id) => selection.toggle(fabrica.id, id)}
 * />
 */
export const useScopedSelection = (): ScopedSelection => {
  const [state, setState] = useState<State>(EMPTY);

  const toggle = useCallback((scopeId: string, id: string) => {
    setState((current) => {
      if (current.scopeId !== scopeId) return { scopeId, ids: new Set([id]) };

      const ids = new Set(current.ids);
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      return ids.size === 0 ? EMPTY : { scopeId, ids };
    });
  }, []);

  const toggleAll = useCallback((scopeId: string, ids: string[]) => {
    setState((current) => {
      const jaTodos =
        current.scopeId === scopeId &&
        ids.length > 0 &&
        ids.every((id) => current.ids.has(id));
      return jaTodos ? EMPTY : { scopeId, ids: new Set(ids) };
    });
  }, []);

  const clear = useCallback(() => setState(EMPTY), []);

  const selectedIn = useCallback(
    (scopeId: string) => (state.scopeId === scopeId ? state.ids : undefined),
    [state]
  );

  const ids = useMemo(() => Array.from(state.ids), [state.ids]);

  return {
    scopeId: state.scopeId,
    ids,
    count: ids.length,
    selectedIn,
    toggle,
    toggleAll,
    clear,
  };
};
