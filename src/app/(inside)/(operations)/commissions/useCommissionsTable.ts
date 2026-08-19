"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { LocalField, useLocalTable } from "@/hooks/useLocalTable";
import { clientName, factoryName } from "@/utils/company";
import { useMemo } from "react";
import { CommissionRow } from "./interface";
import { COMMISSION_STATUS_LABEL } from "./utils";

/**
 * Situação do BOLETO — a coluna "Boleto" da tabela, que não se confunde com a
 * situação da comissão: um boleto vencido pode ter comissão a receber.
 */
const installmentState = (row: CommissionRow): string => {
  if (row.defaultedAt) return "defaulted";
  if (row.isOverdue) return "overdue";
  if (row.paidAt) return "paid";
  return "open";
};

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
 * Os filtros do painel. As opções de fábrica e situação saem das PRÓPRIAS
 * linhas (ver `optionsFrom`), então nenhuma escolha devolve lista vazia.
 */
const FIELDS: Record<string, LocalField<CommissionRow>> = {
  search: {
    type: "text",
    // Cliente e pedido no mesmo campo: quem confere a planilha da fábrica tem
    // ora o nome, ora o número na mão, e não sabe de antemão em qual procurar.
    match: (row, value) => {
      const termo = value.trim().toLowerCase();
      return (
        clientName(row.client).toLowerCase().includes(termo) ||
        row.orderId.slice(0, 8).toLowerCase().includes(termo)
      );
    },
  },
  factoryId: {
    type: "select",
    match: (row, value) => row.factory?.id === value,
  },
  status: {
    type: "select",
    match: (row, value) => row.status === value,
  },
  installmentState: {
    type: "select",
    match: (row, value) => installmentState(row) === value,
  },
  reconciled: {
    type: "select",
    match: (row, value) => row.isReconciled === (value === "yes"),
  },
};

/**
 * O que cada coluna ordenável compara. A chave é o `sortKey` do `Table.Head` —
 * livre, porque quem ordena é o navegador (a lista inteira já está em memória).
 */
const COLUMNS = {
  client: (row: CommissionRow) => clientName(row.client),
  order: (row: CommissionRow) => row.orderId,
  sequence: (row: CommissionRow) => row.sequence,
  dueDate: (row: CommissionRow) => row.dueDate,
  receiveDate: (row: CommissionRow) => row.receiveDate,
  amount: (row: CommissionRow) => Number(row.amount),
  status: (row: CommissionRow) => COMMISSION_STATUS_LABEL[row.status],
  reconciled: (row: CommissionRow) => (row.isReconciled ? 1 : 0),
};

const optionsFrom = (
  rows: CommissionRow[],
  read: (row: CommissionRow) => { value: string; label: string } | null
): SelectOption[] => {
  const seen = new Map<string, string>();
  rows.forEach((row) => {
    const entry = read(row);
    if (entry && !seen.has(entry.value)) seen.set(entry.value, entry.label);
  });
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

/**
 * Filtro e ordenação da tela de comissões.
 *
 * O recorte é da TELA inteira, não de uma tabela: os totais do mês, os cartões
 * das fábricas e o painel de estorno mostram todos o mesmo conjunto de linhas.
 * Um filtro que valesse só dentro de um cartão faria o KPI lá em cima contradizer
 * a tabela logo abaixo dele.
 *
 * A ordenação, por sua vez, vale para todos os cartões de fábrica ao mesmo
 * tempo — é uma coluna só, escolhida uma vez, e a leitura fica comparável entre
 * as fábricas.
 */
export const useCommissionsTable = (
  rows: CommissionRow[],
  canManage: boolean
) => {
  const table = useLocalTable<CommissionRow>({
    items: rows,
    columns: COLUMNS,
    fields: FIELDS,
  });

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        key: "search",
        label: "Cliente ou pedido",
        placeholder: "Nome do cliente ou código do pedido",
      },
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: optionsFrom(rows, (row) =>
          row.factory
            ? { value: row.factory.id, label: factoryName(row.factory) }
            : null
        ),
      },
      {
        type: "select",
        key: "status",
        label: "Situação da comissão",
        placeholder: "Todas as situações",
        options: optionsFrom(rows, (row) => ({
          value: row.status,
          label: COMMISSION_STATUS_LABEL[row.status],
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
    ],
    [rows, canManage]
  );

  return { ...table, filterFields };
};
