"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format/date";
import { PackageSearch, Pencil } from "lucide-react";
import { useState } from "react";
import { ProductInsight } from "../../../interface";
import { stockSituation } from "../../../utils";
import { StockDaysEditor } from "./StockDaysEditor";
import { useUpdateProductStock } from "./useUpdateProductStock";

interface Props {
  insights: ProductInsight[];
  /** Vínculo (cliente × fábrica) do card aberto — âncora da observação avulsa. */
  sellerClientFactoryId: string | null;
  /** Recarrega as estimativas após um registro de estoque. */
  onSaved: () => void;
}

/** Um dado secundário do produto, com rótulo curto e ajuda opcional. */
function Detail({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help?: { title: string; content: string };
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="inline-flex items-center gap-3">
        <Title variant="micro" color="muted">
          {label}
        </Title>
        {help && (
          <HelpTooltip
            label={help.title}
            content={<Title variant="body-sm">{help.content}</Title>}
          />
        )}
      </span>
      <Title variant="body-sm">{value}</Title>
    </div>
  );
}

function ProductStockCard({
  insight,
  isEditing,
  canEdit,
  isLoading,
  onToggleEdit,
  onSave,
  onCancel,
}: {
  insight: ProductInsight;
  isEditing: boolean;
  canEdit: boolean;
  isLoading: boolean;
  onToggleEdit: () => void;
  onSave: (days: number) => void;
  onCancel: () => void;
}) {
  const sit = stockSituation(insight.daysSinceStockout, insight.churnRisk);
  const diasValue = -insight.daysSinceStockout;
  const productName = insight.product?.name ?? "—";

  // Positivo = ainda dura; negativo = provavelmente já zerou há alguns dias.
  const daysLabel =
    diasValue >= 0 ? `${diasValue} dias` : `${Math.abs(diasValue)} dias`;
  const daysCaption = diasValue >= 0 ? "até esgotar" : "em falta";

  const qty = insight.product
    ? `${parseFloat(insight.lastQuantity).toFixed(0)} ${insight.product.unit?.label ?? ""}`.trim()
    : parseFloat(insight.lastQuantity).toFixed(0);

  return (
    <div
      className={cn(
        "flex flex-col gap-12 rounded-(--r-md) border border-(--border) bg-(--bg2) p-16",
        isEditing && "outline-2 outline-(--amber)"
      )}
    >
      <div className="flex items-start justify-between gap-8">
        <Title variant="body" weight="semibold" className="min-w-0 truncate">
          {productName}
        </Title>
        <Badge.Root color={sit.color} appearance="tinted">
          <Badge.Text>{sit.label}</Badge.Text>
        </Badge.Root>
      </div>

      <div className="flex items-end gap-6">
        <Title
          variant="kpi"
          color={sit.color}
          className="text-[32px] leading-none"
        >
          {daysLabel}
        </Title>
        <span className="inline-flex items-center gap-3 pb-1">
          <Title variant="micro" color="secondary">
            {daysCaption}
          </Title>
          <HelpTooltip
            label="O que significam os dias até esgotar?"
            content={
              <Title variant="body-sm">
                Dias restantes até a data estimada de esgotamento. Quando o
                estoque provavelmente já zerou, mostramos há quantos dias ele
                está em falta.
              </Title>
            }
          />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-10 border-t border-(--border) pt-12">
        <Detail
          label="Última compra"
          value={formatDate(insight.lastPurchaseDate)}
        />
        <Detail label="Qtd. comprada" value={qty} />
        <Detail
          label="Duração média"
          value={
            insight.avgShelfDays != null ? `${insight.avgShelfDays} dias` : "—"
          }
          help={{
            title: "O que é a duração média?",
            content:
              "Tempo médio, em dias, que a quantidade comprada costuma durar no cliente — calculado a partir do histórico de pedidos e das médias informadas pelo vendedor.",
          }}
        />
        <Detail
          label="Esgotamento est."
          value={formatDate(insight.estimatedStockoutDate)}
          help={{
            title: "Como é estimado o esgotamento?",
            content:
              "Data estimada em que o estoque do cliente deve zerar, projetada a partir da última compra somada à duração média do produto.",
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          disabled={!canEdit}
          onClick={onToggleEdit}
        >
          <Button.Icon icon={Pencil} />
          <Button.Title>Atualizar estoque</Button.Title>
        </Button.Root>
      </div>

      {isEditing && (
        <StockDaysEditor
          productName={productName}
          initialDays={null}
          isLoading={isLoading}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

/** Produtos acompanhados numa fábrica, com a estimativa de esgotamento. */
export function StockProductsList({
  insights,
  sellerClientFactoryId,
  onSaved,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { save, isLoading } = useUpdateProductStock(
    sellerClientFactoryId,
    onSaved
  );

  const handleSave = async (productId: string, days: number) => {
    await save(productId, days);
    setEditingId(null);
  };

  if (insights.length === 0) {
    return (
      <div data-tour="client-stock-table">
        <EmptyState.Root>
          <EmptyState.Icon>
            <PackageSearch size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum dado de estoque disponível</EmptyState.Title>
          <EmptyState.Description>
            As estimativas aparecem conforme os pedidos e visitas desta fábrica
            são registrados.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <div
      data-tour="client-stock-table"
      className="tablet:grid-cols-2 grid grid-cols-1 gap-12"
    >
      {insights.map((insight) => {
        const productId = insight.product?.id ?? null;
        return (
          <ProductStockCard
            key={insight.id}
            insight={insight}
            isEditing={editingId === insight.id}
            canEdit={!!sellerClientFactoryId && !!productId}
            isLoading={isLoading}
            onToggleEdit={() =>
              setEditingId(editingId === insight.id ? null : insight.id)
            }
            onSave={(days) => productId && handleSave(productId, days)}
            onCancel={() => setEditingId(null)}
          />
        );
      })}
    </div>
  );
}
