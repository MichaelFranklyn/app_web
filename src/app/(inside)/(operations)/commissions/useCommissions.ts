"use client";

import { useMemo, useState } from "react";
import { useCommissionsMonth, useMonthFallback } from "./useCommissionsMonth";
import { useCommissionsQuery } from "./useCommissionsQuery";
import { useCommissionsScope } from "./useCommissionsScope";
import { useCommissionsSelection } from "./useCommissionsSelection";
import { useCommissionsTable } from "./useCommissionsTable";
import { useCommissionsView } from "./useCommissionsView";
import { type CommissionTab } from "./utils";

interface Params {
  canSelectSeller: boolean;
  ownSellerId: string | null;
}

/**
 * A tela de comissões, montada das suas quatro responsabilidades:
 *
 * - **consulta e filtros** — de quem e de que mês (`scope`, `monthNav`, `tab`),
 *   a busca (`query`) e o painel de filtros/ordenação (`table`);
 * - **cálculos** — os totais e os recortes derivados das linhas (`view`);
 * - **seleção e ações** — o lote marcado (`selection`) e o `handleChanged` que
 *   toda escrita chama;
 * - **apresentação** — fica nos componentes: daqui só saem dados prontos.
 *
 * A ordem das chamadas é a das dependências: o escopo e o mês definem a
 * consulta; a consulta alimenta o painel; o painel alimenta os cálculos.
 */
export const useCommissions = ({ canSelectSeller, ownSellerId }: Params) => {
  const scope = useCommissionsScope({ canSelectSeller, ownSellerId });
  const monthNav = useCommissionsMonth();
  const [tab, setTab] = useState<CommissionTab>("receivable");
  const { month } = monthNav;

  const query = useCommissionsQuery({
    sellerId: scope.scopedSellerId,
    month,
    tab,
    skip: scope.dataSkip,
  });
  const { rows } = query;
  useMonthFallback(monthNav, rows, query.latestReceiveDate);

  // Filtro e ordenação valem para a tela toda: os KPIs, os cartões das fábricas
  // e o painel de estorno leem as MESMAS linhas. Um filtro que valesse só dentro
  // de um cartão faria o total lá em cima contradizer a tabela logo abaixo dele.
  // O último argumento liga o que só existe quando a tela soma a empresa
  // inteira: a coluna "Vendedor" e o filtro por vendedor no painel.
  const table = useCommissionsTable(
    rows,
    scope.canManage,
    scope.lens,
    scope.isOfficeScope
  );
  const visibleRows = table.displayedData;

  const view = useCommissionsView({
    rows,
    visibleRows,
    month,
    tab,
    lens: scope.lens,
  });

  const selection = useCommissionsSelection({
    rows,
    groups: view.groups,
    month,
    tab,
    sellerId: scope.scopedSellerId,
    audience: scope.audience,
  });

  // De quem são as parcelas que a lista mostra, para a frase de escopo. No
  // escritório são todos — a menos que o painel de filtros recorte um, e aí a
  // frase tem de dizer o nome dele: "Todos os vendedores" ao lado de uma lista
  // de uma pessoa só seria a própria contradição que a frase existe para evitar.
  const filteredSellerId = table.inputValues.sellerId;
  const { canManage, isOfficeScope, sellerValue } = scope;
  const listScopeLabel = useMemo(() => {
    if (!canManage) return undefined;
    if (!isOfficeScope) return sellerValue?.label ?? null;
    if (!filteredSellerId) return "Todos os vendedores";
    return (
      rows.find((row) => row.seller?.id === filteredSellerId)?.seller?.name ??
      "Um vendedor"
    );
  }, [canManage, isOfficeScope, sellerValue, filteredSellerId, rows]);

  // Nome que assina o PDF: o do seletor (gestor na ótica do vendedor) ou o das
  // próprias linhas (vendedor, que não escolhe ninguém). No escritório não há
  // nome — o papel é da casa, com todos os vendedores dentro dele.
  const sellerName = isOfficeScope
    ? null
    : (sellerValue?.label ?? rows[0]?.seller?.name ?? null);

  return {
    scope,
    monthNav,
    tab,
    setTab,
    query,
    table,
    visibleRows,
    view,
    selection,
    isFiltered: table.totalItems < table.totalUnfiltered,
    listScopeLabel,
    sellerName,
  };
};
