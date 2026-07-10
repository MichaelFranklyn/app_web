"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format/date";

import { StockCandidateGroup } from "./useStockObservation";

interface Props {
  group: StockCandidateGroup;
  /** Quantos produtos desta fábrica já têm resposta do cliente. */
  answered: number;
  /** A aba desta fábrica está aberta. */
  isOpen: boolean;
  onToggle: (group: StockCandidateGroup) => void;
}

export const factoryLabel = (group: StockCandidateGroup): string =>
  group.factory?.nomeFantasia ?? group.factory?.razaoSocial ?? "—";

/** De onde saiu a lista de produtos daquela fábrica. */
export const sourceLabel = (group: StockCandidateGroup): string => {
  if (group.source === "NO_PRODUCTS") {
    return "Cliente nunca comprou desta fábrica";
  }
  if (group.source === "LAST_ORDER") {
    const when = group.lastOrderDate
      ? ` (${formatDate(group.lastOrderDate)})`
      : "";
    return `Do último pedido${when}`;
  }
  return "Sem pedido — produtos com estoque acompanhado";
};

/**
 * Uma fábrica do cliente na visita. Tocar abre (ou fecha) a aba com os produtos
 * dela: o vendedor percorre os catálogos um a um, sem perder de vista os demais.
 */
export function FactoryCard({ group, answered, isOpen, onToggle }: Props) {
  const total = group.products.length;
  const name = factoryLabel(group);

  return (
    <button
      type="button"
      onClick={() => onToggle(group)}
      aria-pressed={isOpen}
      aria-label={`${isOpen ? "Fechar" : "Abrir"} os produtos de ${name}`}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-8 rounded-(--r-md) border p-12 text-left transition-colors",
        isOpen
          ? "border-(--amber) bg-(--bg3)"
          : "border-(--border) bg-(--bg2) hover:bg-(--bg3)"
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <Title variant="body-sm" weight="semibold" className="truncate">
          {name}
        </Title>
        {group.isFocus && (
          <Badge.Root color="red" appearance="tinted" size="sm">
            <Badge.Text>Motivo da visita</Badge.Text>
          </Badge.Root>
        )}
      </div>

      <Title variant="micro" color="muted">
        {sourceLabel(group)}
      </Title>

      <Title variant="micro" color={answered > 0 ? "secondary" : "muted"}>
        {total === 0
          ? "Nenhum produto para observar"
          : `${answered} de ${total} respondidos`}
      </Title>
    </button>
  );
}
