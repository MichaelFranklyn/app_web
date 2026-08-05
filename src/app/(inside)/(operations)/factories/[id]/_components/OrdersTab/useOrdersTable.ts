"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { LocalField, useLocalTable } from "@/hooks/useLocalTable";
import { useMemo } from "react";
import { ORDER_STATUS_LABEL } from "../../../utils";
import { FactoryOrder } from "./gql";

const clientLabel = (order: FactoryOrder) =>
  order.client?.nomeFantasia ?? order.client?.razaoSocial ?? "—";

/** Opções tiradas das próprias linhas — nenhuma escolha devolve lista vazia. */
const optionsFrom = (
  orders: FactoryOrder[],
  read: (order: FactoryOrder) => { value: string; label: string } | null
): SelectOption[] => {
  const seen = new Map<string, string>();
  orders.forEach((order) => {
    const entry = read(order);
    if (entry && !seen.has(entry.value)) seen.set(entry.value, entry.label);
  });
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

const FIELDS: Record<string, LocalField<FactoryOrder>> = {
  clientId: {
    type: "select",
    match: (order, value) => order.client?.id === value,
  },
  sellerId: {
    type: "select",
    match: (order, value) => order.seller?.id === value,
  },
  status: { type: "select", match: (order, value) => order.status === value },
};

const COLUMNS = {
  client: clientLabel,
  seller: (order: FactoryOrder) => order.seller?.name,
  orderDate: (order: FactoryOrder) => order.orderDate,
  // Dinheiro chega como string do backend (Numeric): sem o Number, "1000"
  // ordenaria antes de "300" — comparação de texto, dígito a dígito.
  totalAmount: (order: FactoryOrder) => Number(order.totalAmount),
  commissionAmount: (order: FactoryOrder) => Number(order.commissionAmount),
  status: (order: FactoryOrder) =>
    ORDER_STATUS_LABEL[order.status] ?? order.status,
};

export const useOrdersTable = (orders: FactoryOrder[]) => {
  const table = useLocalTable<FactoryOrder>({
    items: orders,
    columns: COLUMNS,
    fields: FIELDS,
  });

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "clientId",
        label: "Cliente",
        placeholder: "Todos os clientes",
        options: optionsFrom(orders, (order) =>
          order.client
            ? { value: order.client.id, label: clientLabel(order) }
            : null
        ),
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: optionsFrom(orders, (order) =>
          order.seller
            ? { value: order.seller.id, label: order.seller.name }
            : null
        ),
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        options: optionsFrom(orders, (order) => ({
          value: order.status,
          label: ORDER_STATUS_LABEL[order.status] ?? order.status,
        })),
      },
    ],
    [orders]
  );

  return { ...table, filterFields };
};
