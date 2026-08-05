"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { LocalField, useLocalTable } from "@/hooks/useLocalTable";
import { clientName } from "@/utils/company";
import { useMemo } from "react";
import { FactoryClientLink } from "./gql";
import { PRIORITY_OPTIONS, priorityMeta } from "./utils";

/**
 * Opções tiradas das PRÓPRIAS linhas, não de uma consulta à parte.
 *
 * A lista já está toda em memória, então o que aparece no filtro é exatamente o
 * que existe na tabela: nenhum vendedor no seletor que não tenha vínculo aqui, e
 * nenhuma escolha que devolva vazio.
 */
const optionsFrom = (
  links: FactoryClientLink[],
  read: (link: FactoryClientLink) => { value: string; label: string } | null
): SelectOption[] => {
  const seen = new Map<string, string>();
  links.forEach((link) => {
    const entry = read(link);
    if (entry && !seen.has(entry.value)) seen.set(entry.value, entry.label);
  });
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

const FIELDS: Record<string, LocalField<FactoryClientLink>> = {
  search: {
    type: "text",
    match: (link, value) =>
      clientName(link.client).toLowerCase().includes(value.toLowerCase()),
  },
  sellerId: {
    type: "select",
    match: (link, value) => link.seller?.id === value,
  },
  priceTierId: {
    type: "select",
    match: (link, value) => link.priceTier?.id === value,
  },
  priority: {
    type: "select",
    // O vínculo antigo guarda "high"/"medium"/"low"; a tela oferece o
    // vocabulário canônico. Comparar pelo RÓTULO casa os dois sem migração.
    match: (link, value) =>
      priorityMeta(link.priority).label === priorityMeta(value).label,
  },
};

const COLUMNS = {
  client: (link: FactoryClientLink) => clientName(link.client),
  seller: (link: FactoryClientLink) => link.seller?.name,
  priceTier: (link: FactoryClientLink) => link.priceTier?.name,
  priority: (link: FactoryClientLink) => priorityMeta(link.priority).label,
  lastInvoiceDate: (link: FactoryClientLink) => link.lastInvoiceDate,
};

export const useClientsTable = (links: FactoryClientLink[]) => {
  const table = useLocalTable<FactoryClientLink>({
    items: links,
    columns: COLUMNS,
    fields: FIELDS,
  });

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        key: "search",
        label: "Cliente",
        placeholder: "Razão social ou nome fantasia",
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: optionsFrom(links, (link) =>
          link.seller
            ? { value: link.seller.id, label: link.seller.name }
            : null
        ),
      },
      {
        type: "select",
        key: "priceTierId",
        label: "Nível de preço",
        placeholder: "Todos os níveis",
        options: optionsFrom(links, (link) =>
          link.priceTier
            ? { value: link.priceTier.id, label: link.priceTier.name }
            : null
        ),
      },
      {
        type: "select",
        key: "priority",
        label: "Prioridade",
        placeholder: "Todas as prioridades",
        options: PRIORITY_OPTIONS,
      },
    ],
    [links]
  );

  return { ...table, filterFields };
};
