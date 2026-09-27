"use client";

import { Connection, useAllPages } from "@/hooks/useAllPages";
import { factoryName } from "@/utils/company";
import { useMemo } from "react";

import { HISTORY_FACTORIES_QUERY, HISTORY_SELLERS_QUERY } from "./gql";
import { MatchOption } from "./interface";

interface FactoryNode {
  factoryId: string;
  nickname: string | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}
interface SellerNode {
  id: string;
  name: string;
}
interface FactoriesData {
  companyFactories: Connection<FactoryNode>;
}
interface SellersData {
  sellers: Connection<SellerNode>;
}

const selectFactories = (data: FactoriesData) => data.companyFactories;
const selectSellers = (data: SellersData) => data.sellers;

const INPUT = { first: 500, after: null };

/** As fábricas representadas e os vendedores da empresa, para casar com a planilha. */
export function useHistoryOptions() {
  const factories = useAllPages<FactoryNode, FactoriesData>(
    HISTORY_FACTORIES_QUERY,
    INPUT,
    selectFactories
  );
  const sellers = useAllPages<SellerNode, SellersData>(
    HISTORY_SELLERS_QUERY,
    INPUT,
    selectSellers
  );

  const factoryOptions = useMemo<MatchOption[]>(
    () =>
      factories.nodes.map((node) => ({
        id: node.factoryId,
        label: factoryName({ ...node.factory, nickname: node.nickname }),
      })),
    [factories.nodes]
  );
  const sellerOptions = useMemo<MatchOption[]>(
    () => sellers.nodes.map((node) => ({ id: node.id, label: node.name })),
    [sellers.nodes]
  );

  return {
    factoryOptions,
    sellerOptions,
    loading: factories.loading || sellers.loading,
    error: factories.error ?? sellers.error,
    reload: () => {
      factories.reload();
      sellers.reload();
    },
  };
}
