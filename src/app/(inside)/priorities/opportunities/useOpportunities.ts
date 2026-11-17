"use client";

import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { SELLER_PARAM } from "../utils";
import { MY_OPPORTUNITIES_QUERY } from "./gql";
import {
  MyOpportunitiesResponse,
  OpportunitiesContentProps,
  OpportunityKind,
} from "./interface";
import { isOpportunityKind, sortOpportunities } from "./utils";

/**
 * O estado da tela: a leitura e o cartão aberto. O vendedor vem do cabeçalho
 * da central (`?seller=`, escrito pelo `SellerScope`) e só vale para o gestor.
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
  const sellerId = canSelectSeller
    ? searchParams.get(SELLER_PARAM) || null
    : null;

  const { data, loading, error, refetch } = useQuery<MyOpportunitiesResponse>(
    MY_OPPORTUNITIES_QUERY,
    { variables: { sellerId }, fetchPolicy: "cache-and-network" }
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
