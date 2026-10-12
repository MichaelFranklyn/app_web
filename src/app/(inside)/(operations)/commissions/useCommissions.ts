"use client";

import { useMemo, useState } from "react";
import { useCommissionsMonth, useMonthFallback } from "./useCommissionsMonth";
import {
  commissionFilterFields,
  useCommissionsPanel,
} from "./useCommissionsPanel";
import { useCommissionsQuery } from "./useCommissionsQuery";
import { useCommissionsScope } from "./useCommissionsScope";
import { useCommissionsSelection } from "./useCommissionsSelection";
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
 *   o painel de filtros/ordenação (`panel`) e a busca (`query`);
 * - **números** — os totais e os cartões, lidos da resposta (`view`);
 * - **seleção e ações** — o lote marcado (`selection`) e o `handleChanged` que
 *   toda escrita chama;
 * - **apresentação** — fica nos componentes: daqui só saem dados prontos.
 *
 * A ordem das chamadas é a das dependências: o escopo, o mês e o painel definem
 * a consulta; a consulta alimenta os números. As CONTAS são do servidor — o mês
 * pode ter milhares de parcelas, e a tela recebe só o resumo e a página aberta
 * de cada fábrica.
 */
export const useCommissions = ({ canSelectSeller, ownSellerId }: Params) => {
  const scope = useCommissionsScope({ canSelectSeller, ownSellerId });
  const monthNav = useCommissionsMonth();
  const [tab, setTab] = useState<CommissionTab>("receivable");
  const { month } = monthNav;
  const { canManage, isOfficeScope, sellerValue } = scope;

  // Filtro e ordenação valem para a tela toda: os KPIs, os cartões das fábricas
  // e o painel de estorno leem o MESMO recorte. O argumento liga o que só
  // existe quando a tela soma a empresa inteira: o filtro por vendedor.
  const panel = useCommissionsPanel(isOfficeScope);

  const query = useCommissionsQuery({
    sellerId: scope.scopedSellerId,
    audience: scope.audience,
    month,
    tab,
    panelInput: panel.panelInput,
    skip: scope.dataSkip,
  });
  const { summary } = query;
  useMonthFallback(monthNav, query.hasMovement, query.latestReceiveDate);

  const view = useCommissionsView(summary);

  const filterFields = useMemo(
    () =>
      commissionFilterFields({
        factories: summary?.factoryOptions ?? [],
        sellers: summary?.sellerOptions ?? [],
        statuses: summary?.statusOptions ?? [],
        canManage,
        showSeller: isOfficeScope,
      }),
    [summary, canManage, isOfficeScope]
  );

  const selection = useCommissionsSelection({
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
  const filteredSellerId = panel.inputValues.sellerId;
  const sellerOptions = summary?.sellerOptions;
  const listScopeLabel = useMemo(() => {
    if (!canManage) return undefined;
    if (!isOfficeScope) return sellerValue?.label ?? null;
    if (!filteredSellerId) return "Todos os vendedores";
    return (
      sellerOptions?.find((option) => option.value === filteredSellerId)
        ?.label ?? "Um vendedor"
    );
  }, [canManage, isOfficeScope, sellerValue, filteredSellerId, sellerOptions]);

  // Nome que assina o PDF: o do seletor (gestor na ótica do vendedor) ou o do
  // dono das linhas (vendedor, que não escolhe ninguém — as opções dele têm um
  // nome só, o próprio). No escritório não há nome — o papel é da casa, com
  // todos os vendedores dentro dele.
  const sellerName = isOfficeScope
    ? null
    : (sellerValue?.label ?? sellerOptions?.[0]?.label ?? null);

  return {
    scope,
    monthNav,
    tab,
    setTab,
    panel,
    filterFields,
    query,
    view,
    selection,
    listScopeLabel,
    sellerName,
  };
};
