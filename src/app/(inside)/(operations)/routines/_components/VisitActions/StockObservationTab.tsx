"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { PackageSearch } from "lucide-react";

import { VisitScheduleItem } from "../../interface";
import { STOCK_OBSERVATION_OPTIONS, formatDayLabel } from "../../utils";
import { useStockObservation } from "./useStockObservation";

interface Props {
  item: VisitScheduleItem;
  onSaved?: () => void;
}

export function StockObservationTab({ item, onSaved }: Props) {
  const {
    loading,
    products,
    lastOrder,
    obsMap,
    toggle,
    selectedCount,
    handleSave,
    isLoading,
  } = useStockObservation(item, onSaved);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loading.Spinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <EmptyState.Root>
          <EmptyState.Icon>
            <PackageSearch />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum produto para observar</EmptyState.Title>
          <EmptyState.Description>
            Este cliente ainda não tem pedidos nesta fábrica, então não há
            produtos do último pedido para registrar a observação de estoque.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Title variant="body-sm" color="muted">
        Produtos do último pedido
        {lastOrder ? ` (${formatDayLabel(lastOrder.orderDate)})` : ""} — marque
        como está o estoque de cada um.
      </Title>

      <div className="flex flex-col gap-8">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-12 rounded-(--r-md) border border-(--border) bg-(--bg3) px-12 py-10"
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-(--text)">
                {p.name}
              </div>
              <div className="text-[13px] text-(--muted)">{p.sku}</div>
            </div>
            <div className="flex shrink-0 gap-4">
              {STOCK_OBSERVATION_OPTIONS.map((opt) => {
                const active = obsMap[p.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(p.id, opt.value)}
                    className={`rounded-(--r-sm) border px-8 py-4 text-[13px] transition-colors ${
                      active
                        ? "border-(--amber) bg-(--amber) text-black"
                        : "border-(--border) text-(--muted) hover:border-(--border2)"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Title variant="body-xs" color="muted">
          {selectedCount} de {products.length} marcados
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
          <Button.Title>Salvar observações</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
