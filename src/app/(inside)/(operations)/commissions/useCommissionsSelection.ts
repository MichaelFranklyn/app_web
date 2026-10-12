"use client";

import { useScopedSelection } from "@/hooks/useScopedSelection";
import { useEffect, useMemo } from "react";
import { CommissionRow } from "./interface";
import {
  type CommissionAudience,
  type CommissionTab,
  type FactoryGroup,
  monthLabel,
  type YearMonth,
} from "./utils";

interface Params {
  rows: CommissionRow[];
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
 */
export const useCommissionsSelection = ({
  rows,
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

  const selectedRows = useMemo(() => {
    if (selection.count === 0) return [];
    const ids = new Set(selection.ids);
    return rows.filter((row) => ids.has(row.installmentId));
  }, [rows, selection.ids, selection.count]);

  const receivableIds = useMemo(
    () =>
      selectedRows
        .filter((row) => row.isReceivable)
        .map((row) => row.installmentId),
    [selectedRows]
  );

  const scopeLabel = useMemo(() => {
    const group = groups.find((g) => g.factoryId === selection.scopeId);
    return group ? `${group.name} · ${monthLabel(month)}` : monthLabel(month);
  }, [groups, selection.scopeId, month]);

  return { ...selection, receivableIds, scopeLabel };
};

export type CommissionsSelection = ReturnType<typeof useCommissionsSelection>;
