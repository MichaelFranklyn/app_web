"use client";

import { SelectOption } from "@/components/Input";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { MY_OPPORTUNITIES_QUERY, OPPORTUNITIES_SELLERS_QUERY } from "./gql";
import {
  MyOpportunitiesResponse,
  OpportunitiesContentProps,
  OpportunitiesSellersResponse,
  OpportunityKind,
} from "./interface";
import { isOpportunityKind, sortOpportunities } from "./utils";

const EMPTY_INPUT = {};
const getSellers = (d: OpportunitiesSellersResponse) => d.opportunities_sellers;

/**
 * O estado da tela: o vendedor escolhido, a leitura e o cartão aberto.
 *
 * O cartão aberto mora na URL (`?open=PRIORITY_OFF_ROUTE`) para o aviso do
 * sino chegar com a lista já aberta, e para voltar da ficha do cliente e cair
 * no mesmo lugar.
 */
export function useOpportunities({
  canSelectSeller,
  seed,
}: Pick<OpportunitiesContentProps, "canSelectSeller" | "seed">) {
  useSeedQuery([
    {
      query: MY_OPPORTUNITIES_QUERY,
      variables: { sellerId: null },
      data: seed,
    },
  ]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sellerId, setSellerId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<MyOpportunitiesResponse>(
    MY_OPPORTUNITIES_QUERY,
    { variables: { sellerId }, fetchPolicy: "cache-and-network" }
  );

  const sellersQuery = useCompleteList<OpportunitiesSellersResponse>(
    OPPORTUNITIES_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller }
  );

  const sellerOptions: SelectOption[] = useMemo(
    () =>
      (sellersQuery.data?.opportunities_sellers.edges ?? [])
        .filter(({ node }) => node.isActive)
        .map(({ node }) => ({ value: node.id, label: node.name })),
    [sellersQuery.data]
  );

  const opportunities = useMemo(
    () => sortOpportunities(data?.myInsights?.data?.insights ?? []),
    [data]
  );

  const openParam = searchParams.get("open");
  const openKind: OpportunityKind | null = isOpportunityKind(openParam)
    ? openParam
    : null;

  const toggle = (kind: OpportunityKind) => {
    const params = new URLSearchParams(searchParams.toString());
    if (openKind === kind) params.delete("open");
    else params.set("open", kind);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const readAt = data?.myInsights?.data?.generatedAt
    ? new Date(data.myInsights.data.generatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return {
    sellerId,
    setSellerId,
    sellerOptions,
    opportunities,
    openKind,
    toggle,
    readAt,
    loading,
    failed: !!error && !data,
    showSkeleton: loading && !data,
    refetch,
  };
}
