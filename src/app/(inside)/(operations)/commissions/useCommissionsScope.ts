"use client";

import { SelectOption } from "@/components/Input";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useEffect, useMemo, useState } from "react";
import { COMMISSIONS_SELLERS_QUERY } from "./gql";
import { CommissionsSellersResponse } from "./interface";
import { type CommissionAudience, lensFor } from "./utils";

// Catálogo pequeno carregado por inteiro: `useCompleteList` rebusca pelo
// total se um dia passar da primeira página, em vez de truncar calado.
const EMPTY_INPUT = {};
const getSellers = (d: CommissionsSellersResponse) => d.commissions_sellers;

interface Params {
  /** Gestor (owner/admin/su): pode escolher de qual vendedor ver as comissões. */
  canSelectSeller: boolean;
  /** Perfil de vendedor do próprio gestor, quando ele também vende. */
  ownSellerId: string | null;
}

/**
 * De QUEM são as comissões da tela e de quem é o dinheiro que ela conta.
 *
 * São duas escolhas que andam juntas — o vendedor e a ótica — e é delas que sai
 * o escopo da consulta (`scopedSellerId`).
 */
export const useCommissionsScope = ({
  canSelectSeller,
  ownSellerId,
}: Params) => {
  // Vendedor só VISUALIZA quanto vai ganhar; conferir contra a planilha e marcar
  // repasse ("bater valores") é tarefa de gestão (gestor = quem pode escolher vendedor).
  const canManage = canSelectSeller;

  // ── De quem é o dinheiro da tela ───────────────────────────────────────────
  // Abre no ESCRITÓRIO: é o trabalho diário de quem gerencia (conferir o que a
  // fábrica pagou). A ótica do vendedor responde outra pergunta — "o que eu
  // devo a ele" — e o vendedor logado só tem essa, com os campos principais já
  // no nível dele (ver `lensFor`).
  //
  // A ótica governa também o ESCOPO da tela, e não só a leitura dos campos: o
  // que as fábricas devem ao escritório é uma conta da CASA INTEIRA, e mostrá-la
  // um vendedor de cada vez nunca dava o número que se confere contra a planilha
  // da fábrica — a planilha vem por fábrica, com os pedidos de todo mundo
  // dentro. Por isso, no escritório, o seletor de vendedor sai de cena (travado
  // em "Todos os vendedores"); ele volta a valer quando a pergunta passa a ser
  // "quanto eu devo a fulano".
  const [audience, setAudience] = useState<CommissionAudience>("office");
  const lens = useMemo(
    () => lensFor(audience, canManage),
    [audience, canManage]
  );
  // Os rótulos da tela só se especializam quando existem DUAS óticas para
  // escolher: para o vendedor, "a comissão" é a dele e chamá-la de "repasse ao
  // vendedor" seria explicar-lhe uma distinção que não existe na tela dele.
  const isSellerView = canManage && lens.audience === "seller";
  /** No escritório a tela soma a empresa inteira — sem recorte de vendedor. */
  const isOfficeScope = canManage && !isSellerView;

  // ── Seletor de vendedor (só gestor) ────────────────────────────────────────
  const sellersQuery = useCompleteList<CommissionsSellersResponse>(
    COMMISSIONS_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller }
  );
  const sellers = useMemo(
    () => sellersQuery.data?.commissions_sellers.edges.map((e) => e.node) ?? [],
    [sellersQuery.data]
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Default: o próprio perfil quando o gestor também vende, senão o primeiro.
  useEffect(() => {
    if (canSelectSeller && !selectedSellerId && sellers.length > 0) {
      const own = ownSellerId && sellers.find((s) => s.id === ownSellerId);
      setSelectedSellerId(own ? own.id : sellers[0].id);
    }
  }, [canSelectSeller, selectedSellerId, sellers, ownSellerId]);

  const sellerOptions = useMemo<SelectOption[]>(
    () => sellers.map((s) => ({ value: s.id, label: s.name })),
    [sellers]
  );
  const sellerValue = useMemo(
    () => sellerOptions.find((o) => o.value === selectedSellerId) ?? null,
    [sellerOptions, selectedSellerId]
  );

  // De quem a consulta pede as comissões: ninguém em especial no escritório (a
  // empresa inteira), o vendedor escolhido na ótica dele. O vendedor logado não
  // escolhe — o backend já recorta a lista pelo dono da sessão.
  const scopedSellerId = isOfficeScope ? null : selectedSellerId;

  // Na ótica do vendedor, gestor sem vendedor escolhido ainda não busca (evita
  // query sem escopo). No escritório não há o que esperar: a tela já sabe o que
  // pedir antes de o catálogo de vendedores chegar.
  const dataSkip = canSelectSeller && !isOfficeScope && !selectedSellerId;

  return {
    canSelectSeller,
    canManage,
    audience,
    setAudience,
    lens,
    isSellerView,
    isOfficeScope,
    sellerOptions,
    sellerValue,
    selectSeller: setSelectedSellerId,
    scopedSellerId,
    dataSkip,
  };
};

export type CommissionsScope = ReturnType<typeof useCommissionsScope>;
