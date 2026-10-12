"use client";

import { useMemo } from "react";
import { CommissionRow } from "./interface";
import {
  type CommissionLens,
  type CommissionTab,
  filterByMonth,
  filterByTab,
  groupByFactory,
  summarizeMonth,
  type YearMonth,
} from "./utils";

interface Params {
  /** A resposta inteira do servidor (inclui o que foge do mês). */
  rows: CommissionRow[];
  /** As mesmas linhas depois do painel de filtros e da ordenação. */
  visibleRows: CommissionRow[];
  month: YearMonth;
  tab: CommissionTab;
  lens: CommissionLens;
}

/**
 * Os números e os recortes que a tela exibe, derivados das linhas.
 *
 * Nada aqui busca nem guarda estado: é a conta que transforma "linhas do
 * servidor + mês + situação + ótica" nos totais do topo e nos cartões das
 * fábricas. Fica separado para que mudar a apresentação não toque na conta, e
 * vice-versa.
 */
export const useCommissionsView = ({
  rows,
  visibleRows,
  month,
  tab,
  lens,
}: Params) => {
  const monthTotals = useMemo(
    () => summarizeMonth(visibleRows, month, lens),
    [visibleRows, month, lens]
  );

  // Os dois filtros da tela — mês e situação — valem para TUDO o que vem
  // abaixo, inclusive os cartões das fábricas. Antes cada fábrica tinha o seu
  // próprio seletor de mês e o de cima só mexia nos totais: dois lugares para
  // escolher a mesma coisa, mostrando meses diferentes na mesma tela.
  const filteredRows = useMemo(
    () => filterByTab(filterByMonth(visibleRows, month, tab, lens), tab, lens),
    [visibleRows, tab, month, lens]
  );

  // Quantas parcelas o mês e a situação deixam passar ANTES do painel de
  // filtros: é com este número que a frase de escopo compara o que sobrou.
  // `totalUnfiltered` não serve — ele conta a resposta inteira do servidor, que
  // inclui outros meses (estorno do vendedor, boleto travado).
  const scopeTotal = useMemo(
    () => filterByTab(filterByMonth(rows, month, tab, lens), tab, lens).length,
    [rows, tab, month, lens]
  );

  // Agrupado por fábrica trabalhada — é assim que a fábrica manda a planilha.
  const groups = useMemo(() => groupByFactory(filteredRows), [filteredRows]);

  return { monthTotals, filteredRows, scopeTotal, groups };
};
