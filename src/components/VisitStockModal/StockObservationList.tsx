"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Tabs } from "@/components/Tabs";
import { Title } from "@/components/Title";
import { PackageSearch, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FactoryCard, factoryLabel, sourceLabel } from "./FactoryCard";
import { ProductDaysRow } from "./ProductDaysRow";
import {
  StockCandidateGroup,
  useStockObservation,
} from "./useStockObservation";

interface Props {
  itemId: string;
  onSaved?: () => void;
  /** Sobe para o modal: ele fecha o estoque e abre o pedido. Nunca empilhar modais. */
  onOrder: (group: StockCandidateGroup) => void;
}

/**
 * O vendedor está na loja e pode perguntar pelo estoque de qualquer fábrica do
 * cliente — não só da que motivou a visita.
 *
 * A grade de cards mostra todas elas; tocar num card abre a aba daquela fábrica
 * com os seus produtos. As abas se acumulam, então ele percorre um catálogo de
 * cada vez sem perder o que já respondeu nos outros.
 *
 * O que ele marca aqui vira insumo do próximo score: cada observação corrige a
 * data estimada de esgotamento daquele produto naquela fábrica.
 */
export function StockObservationList({ itemId, onSaved, onOrder }: Props) {
  const {
    loading,
    groups,
    totalProducts,
    daysMap,
    setDays,
    selectedCount,
    handleSave,
    isLoading,
  } = useStockObservation(itemId, onSaved);

  // Abas abertas, na ordem em que o vendedor tocou nos cards.
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  // As fábricas que motivaram a visita já abrem: é o que ele veio tratar. Sem
  // foco (visita antiga ou registro tardio), abre a primeira da lista.
  useEffect(() => {
    if (groups.length === 0) return;
    const focus = groups
      .filter((g) => g.isFocus)
      .map((g) => g.sellerClientFactoryId);
    const initial =
      focus.length > 0 ? focus : [groups[0].sellerClientFactoryId];
    setOpenTabs(initial);
    setActiveTab(initial[0]);
  }, [groups]);

  const answeredByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of groups) {
      counts[group.sellerClientFactoryId] = group.products.filter(
        (p) => daysMap[p.id] != null
      ).length;
    }
    return counts;
  }, [groups, daysMap]);

  const toggleTab = (group: StockCandidateGroup) => {
    const id = group.sellerClientFactoryId;
    setOpenTabs((prev) => {
      if (!prev.includes(id)) {
        setActiveTab(id);
        return [...prev, id];
      }
      const next = prev.filter((t) => t !== id);
      // Fechou a aba ativa: cai na vizinha, senão o painel some sem explicação.
      if (activeTab === id) setActiveTab(next[next.length - 1] ?? "");
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loading.Spinner />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <PackageSearch />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhuma fábrica vinculada</EmptyState.Title>
        <EmptyState.Description>
          Este cliente não tem nenhuma fábrica atendida por você.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  const openGroups = groups.filter((g) =>
    openTabs.includes(g.sellerClientFactoryId)
  );

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <Title variant="body-sm" weight="semibold">
          Fábricas deste cliente
        </Title>
        <div className="desktop:grid-cols-3 tablet:grid-cols-2 grid grid-cols-1 gap-8">
          {groups.map((group) => (
            <FactoryCard
              key={group.sellerClientFactoryId}
              group={group}
              answered={answeredByGroup[group.sellerClientFactoryId] ?? 0}
              isOpen={openTabs.includes(group.sellerClientFactoryId)}
              onToggle={toggleTab}
            />
          ))}
        </div>
      </div>

      {openGroups.length > 0 && activeTab && (
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            {openGroups.map((group) => (
              <Tabs.Item
                key={group.sellerClientFactoryId}
                value={group.sellerClientFactoryId}
              >
                {factoryLabel(group)}
              </Tabs.Item>
            ))}
          </Tabs.List>

          {openGroups.map((group) => (
            <Tabs.Content
              key={group.sellerClientFactoryId}
              value={group.sellerClientFactoryId}
            >
              <div className="flex flex-col gap-12 pt-12">
                <div className="flex items-start justify-between gap-8">
                  <Title variant="micro" color="muted">
                    {sourceLabel(group)}
                  </Title>
                  <Button.Root
                    type="button"
                    appearance="outline"
                    color="neutral"
                    size="sm"
                    noUppercase
                    disabled={!group.factory}
                    onClick={() => onOrder(group)}
                  >
                    <Button.Icon icon={ReceiptText} />
                    <Button.Title>Lançar pedido</Button.Title>
                  </Button.Root>
                </div>

                {group.products.length === 0 ? (
                  <EmptyState.Root>
                    <EmptyState.Icon>
                      <PackageSearch />
                    </EmptyState.Icon>
                    <EmptyState.Title>
                      Nada para observar ainda
                    </EmptyState.Title>
                    <EmptyState.Description>
                      O cliente nunca comprou desta fábrica. Lance o primeiro
                      pedido dela e os produtos passam a ser acompanhados.
                    </EmptyState.Description>
                  </EmptyState.Root>
                ) : (
                  <div className="desktop:grid-cols-2 grid grid-cols-1 gap-8">
                    {group.products.map((product) => (
                      <ProductDaysRow
                        key={product.id}
                        product={product}
                        days={daysMap[product.id]}
                        onChange={setDays}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}

      <div className="flex items-center justify-between border-t border-(--border) pt-12">
        <Title variant="body-xs" color="muted">
          {selectedCount} de {totalProducts} respondidos
        </Title>
        <Button.Root
          type="button"
          appearance="solid"
          color="amber"
          size="md"
          noUppercase
          loading={isLoading}
          onClick={handleSave}
        >
          <Button.Title>Salvar estoque</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
