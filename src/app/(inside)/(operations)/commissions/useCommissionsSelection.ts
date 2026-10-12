"use client";

import { useScopedSelection } from "@/hooks/useScopedSelection";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ignoresMonth } from "./help";
import { CommissionRow } from "./interface";
import {
  type CommissionAudience,
  type CommissionTab,
  type FactoryGroup,
  monthLabel,
  selectionScope,
  type YearMonth,
} from "./utils";

interface Params {
  groups: FactoryGroup[];
  // Os quatro abaixo são o que troca as linhas debaixo do lote: qualquer
  // mudança neles limpa a seleção.
  month: YearMonth;
  tab: CommissionTab;
  sellerId: string | null;
  audience: CommissionAudience;
}

/**
 * As parcelas marcadas para a ação em lote.
 *
 * A seleção mora na página, e não em cada cartão, para que exista UMA por vez:
 * a barra de atalhos é uma só, e um lote que misturasse fábricas seria marcado
 * com a data de repasse errada.
 *
 * As linhas agora chegam aos pedaços (uma página por cartão), então a seleção
 * guarda também o CONTEÚDO do que foi marcado: cada cartão registra aqui as
 * linhas que exibe (`register`), e a barra lê delas a situação de cada parcela
 * — inclusive das marcadas numa página que já não está aberta.
 */
export const useCommissionsSelection = ({
  groups,
  month,
  tab,
  sellerId,
  audience,
}: Params) => {
  const selection = useScopedSelection();
  const { clear } = selection;

  // Trocar de mês, de situação, de vendedor ou de ótica troca as linhas debaixo
  // do lote — manter a seleção marcaria parcelas que saíram da tela.
  useEffect(() => {
    clear();
  }, [month, tab, sellerId, audience, clear]);

  // Só se marca o que está na tela, então toda linha marcada passou por aqui.
  // Junto vai QUAL é a página aberta de cada fábrica: é o que permite dizer
  // quantas das marcadas já não estão à vista.
  const known = useRef(new Map<string, CommissionRow>());
  const openPage = useRef(new Map<string, Set<string>>());
  const [knownVersion, setKnownVersion] = useState(0);
  const register = useCallback((scopeId: string, rows: CommissionRow[]) => {
    rows.forEach((row) => known.current.set(row.installmentId, row));
    openPage.current.set(scopeId, new Set(rows.map((r) => r.installmentId)));
    // Uma busca nova pode trazer a mesma parcela em outro estado (conferida,
    // paga), e trocar de página muda o que está à vista: o lote relê.
    setKnownVersion((version) => version + 1);
  }, []);

  const selectedRows = useMemo(() => {
    if (selection.count === 0) return [];
    return selection.ids
      .map((id) => known.current.get(id))
      .filter((row): row is CommissionRow => Boolean(row));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.ids, selection.count, knownVersion]);

  const receivableIds = useMemo(
    () =>
      selectedRows
        .filter((row) => row.isReceivable)
        .map((row) => row.installmentId),
    [selectedRows]
  );

  // O alcance do lote, por extenso: a barra e os modais de confirmação dizem a
  // mesma coisa (ver `selectionScope`).
  const scope = useMemo(() => {
    const group = groups.find((g) => g.factoryId === selection.scopeId);
    const onPage = selection.scopeId
      ? openPage.current.get(selection.scopeId)
      : undefined;
    return selectionScope({
      factoryName: group?.name ?? null,
      periodLabel: ignoresMonth(tab)
        ? "todos os vencimentos"
        : monthLabel(month),
      selected: selection.count,
      total: group?.count ?? selection.count,
      offPage: onPage
        ? selection.ids.filter((id) => !onPage.has(id)).length
        : 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    groups,
    selection.scopeId,
    selection.ids,
    selection.count,
    month,
    tab,
    knownVersion,
  ]);

  return {
    ...selection,
    selectedRows,
    receivableIds,
    scopeLabel: scope.label,
    scopeSentence: scope.sentence,
    register,
  };
};

export type CommissionsSelection = ReturnType<typeof useCommissionsSelection>;
