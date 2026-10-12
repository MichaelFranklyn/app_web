"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { FieldConfig, useTableFilters } from "@/hooks/useTableFilters";
import { useUrlSort } from "@/hooks/useUrlSort";
import { useMemo } from "react";
import { CommissionOption } from "./interface";
import { type CommissionStatus } from "./interface";
import { COMMISSION_STATUS_LABEL } from "./utils";

/**
 * As colunas ordenáveis dos cartões de fábrica — a lista de permissão do
 * `sortBy` da URL. Quem ordena é o SERVIDOR (`CommissionMonthInput.sortBy`):
 * com as linhas paginadas, ordenar aqui reordenaria só a página aberta e
 * chamaria isso de "a maior comissão".
 *
 * As colunas do painel de estornos (`cb…`) ficam de fora: aquela lista vem
 * inteira e continua ordenando no navegador.
 */
export const COMMISSIONS_SORT_KEYS = [
  "client",
  "seller",
  "order",
  "invoiceNumber",
  "sequence",
  "dueDate",
  "receiveDate",
  "amount",
  "status",
  "reconciled",
];

/**
 * Os campos do painel como a URL os guarda → como o servidor os recebe.
 * `sellerId` do painel vira `panelSellerId`: o `sellerId` da consulta é o
 * escopo do gestor (o seletor lá em cima), que é outra pergunta.
 */
const PANEL_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search" },
  factoryId: { type: "select", queryField: "factoryId" },
  status: { type: "select", queryField: "status" },
  installmentState: { type: "select", queryField: "installmentState" },
  reconciled: { type: "select", queryField: "reconciled" },
};

const SELLER_FIELD: Record<string, FieldConfig> = {
  sellerId: { type: "select", queryField: "panelSellerId" },
};

/**
 * Situação do BOLETO — a coluna "Boleto" da tabela, que não se confunde com a
 * situação da comissão: um boleto vencido pode ter comissão a receber.
 */
const INSTALLMENT_STATE_OPTIONS: SelectOption[] = [
  { value: "open", label: "A vencer" },
  { value: "overdue", label: "Vencido" },
  { value: "paid", label: "Pago" },
  { value: "defaulted", label: "Não pagou" },
];

const RECONCILED_OPTIONS: SelectOption[] = [
  { value: "yes", label: "Conferida" },
  { value: "no", label: "Não conferida" },
];

/**
 * Filtro e ordenação da tela de comissões — o que vai na URL e na consulta.
 *
 * O recorte é da TELA inteira, não de uma tabela: os totais do mês, os cartões
 * das fábricas e o painel de estorno mostram todos o mesmo conjunto de linhas.
 * Um filtro que valesse só dentro de um cartão faria o KPI lá em cima
 * contradizer a tabela logo abaixo dele. Por isso ele vai ao servidor, que soma
 * os cartões sobre o resultado COMPLETO do recorte.
 *
 * A ordenação vale para todos os cartões de fábrica ao mesmo tempo — é uma
 * coluna só, escolhida uma vez, e a leitura fica comparável entre as fábricas.
 */
export const useCommissionsPanel = (
  /**
   * A tela está somando TODOS os vendedores? Só então existe o filtro por
   * vendedor — e só então ele é aplicado: fora daí o campo nem entra no mapa,
   * senão um recorte esquecido na URL continuaria valendo, invisível, numa
   * tela que já mostra uma pessoa só.
   */
  showSeller: boolean
) => {
  const config = useMemo(
    () => (showSeller ? { ...PANEL_FIELDS, ...SELLER_FIELD } : PANEL_FIELDS),
    [showSeller]
  );
  const filters = useTableFilters(config);
  const sort = useUrlSort(COMMISSIONS_SORT_KEYS, filters.setParams);

  // Os valores JÁ debounceados (`queryValues`): mandar o que está sendo
  // digitado refaria a consulta a cada tecla.
  const panelInput = useMemo(() => {
    const input: Record<string, string> = {};
    for (const [key, value] of Object.entries(filters.queryValues)) {
      const field = config[key];
      if (value && field) input[field.queryField] = value;
    }
    if (sort.key) {
      input.sortBy = sort.key;
      input.sortDir = sort.direction;
    }
    return input;
  }, [filters.queryValues, config, sort.key, sort.direction]);

  return {
    sort,
    panelInput,
    inputValues: filters.inputValues,
    setFilter: filters.setFilter,
    setFilters: filters.setFilters,
  };
};

interface FieldsParams {
  /** Opções tiradas das linhas do recorte, ANTES do filtro (o servidor manda). */
  factories: CommissionOption[];
  sellers: CommissionOption[];
  statuses: CommissionOption[];
  canManage: boolean;
  showSeller: boolean;
}

/**
 * Os campos do painel. As opções de fábrica, vendedor e situação saem das
 * PRÓPRIAS linhas do recorte, então nenhuma escolha devolve lista vazia.
 *
 * A situação segue a lente no servidor: filtrar por "Recebido" na ótica do
 * vendedor traz o que o ESCRITÓRIO repassou a ele, não o que a fábrica pagou à
 * empresa.
 */
export const commissionFilterFields = ({
  factories,
  sellers,
  statuses,
  canManage,
  showSeller,
}: FieldsParams): FilterField[] => [
  {
    type: "text",
    key: "search",
    label: "Cliente, pedido ou nota",
    placeholder: "Nome do cliente, código do pedido ou número da nota",
  },
  {
    type: "select",
    key: "sellerId",
    label: "Vendedor",
    placeholder: "Todos os vendedores",
    options: sellers.map(({ value, label }) => ({ value, label })),
    // Só quando a tela soma a empresa inteira: na ótica do vendedor a lista
    // já é de uma pessoa, e o filtro ofereceria um nome só. Diferente do
    // seletor lá em cima, este RECORTA a tela toda — os cartões do mês
    // inclusive —, e a linha de escopo diz quantas parcelas sobraram.
    hidden: !showSeller,
  },
  {
    type: "select",
    key: "factoryId",
    label: "Fábrica",
    placeholder: "Todas as fábricas",
    options: factories.map(({ value, label }) => ({ value, label })),
  },
  {
    type: "select",
    key: "status",
    label: "Situação da comissão",
    placeholder: "Todas as situações",
    // O rótulo é o da tela, não o do servidor.
    options: statuses.map((option) => ({
      value: option.value,
      label:
        COMMISSION_STATUS_LABEL[option.value as CommissionStatus] ??
        option.label,
    })),
  },
  {
    type: "select",
    key: "installmentState",
    label: "Boleto",
    placeholder: "Todos os boletos",
    options: INSTALLMENT_STATE_OPTIONS,
  },
  {
    type: "select",
    key: "reconciled",
    label: "Conferência",
    placeholder: "Conferidas e não conferidas",
    options: RECONCILED_OPTIONS,
    // Conferir é tarefa de gestão: o vendedor não vê a coluna, então
    // filtrar por ela só lhe daria um resultado sem explicação na tela.
    hidden: !canManage,
  },
];
