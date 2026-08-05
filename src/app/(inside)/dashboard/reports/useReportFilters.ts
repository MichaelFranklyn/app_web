"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { formatDateRangeLabel } from "../utils";
import { ReportFilters } from "./interface";
import { getCurrentMonthRangeIso } from "./utils";

/**
 * O recorte dos relatórios (período + vendedor) lido e escrito na URL.
 *
 * Mora na URL, e não em estado de React, por três razões: trocar de aba é uma
 * navegação (o estado morreria a cada clique), o link mandado no WhatsApp abre o
 * mesmo papel do outro lado, e o botão "voltar" desfaz o filtro em vez de sair
 * da tela.
 *
 * `sellerId` ausente = a empresa toda. Para um vendedor o parâmetro é
 * irrelevante: o backend escopa pelo token, e mexer nele não abre a carteira do
 * colega.
 */
export const useReportFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaults = useMemo(getCurrentMonthRangeIso, []);

  const filters: ReportFilters = useMemo(
    () => ({
      from: searchParams.get("from") ?? defaults.from,
      to: searchParams.get("to") ?? defaults.to,
      sellerId: searchParams.get("seller"),
    }),
    [searchParams, defaults]
  );

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      // Trocar o recorte volta para a primeira página: ficar na página 4 de uma
      // lista que encolheu mostraria a tabela vazia.
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const setRange = useCallback(
    (range: { from: string; to: string }) => push(range),
    [push]
  );

  const setSellerId = useCallback(
    (sellerId: string | null) => push({ seller: sellerId }),
    [push]
  );

  /** Querystring atual, para as abas navegarem sem perder o recorte. */
  const query = searchParams.toString();

  return {
    filters,
    setRange,
    setSellerId,
    query,
    rangeLabel: formatDateRangeLabel(filters.from, filters.to),
  };
};
