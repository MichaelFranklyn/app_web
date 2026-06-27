import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { Title } from "@/components/Title";
import { Info } from "lucide-react";

import { ImportPriceListResult } from "./interface";

export function ResultView({ result }: { result: ImportPriceListResult }) {
  const imported = result.totalRows - result.failed;
  return (
    <div className="flex flex-col gap-8">
      {/* Reconciliação principal: responde "todas as linhas subiram?" de forma direta. */}
      <Card.Root isCompact className="flex flex-row items-baseline gap-6">
        <Title
          variant="heading-sm"
          weight="bold"
          color={result.failed > 0 ? "amber" : "green"}
        >
          {imported} de {result.totalRows}
        </Title>
        <Title variant="body-sm" color="muted">
          linha(s) enviada(s) gravada(s)
          {result.failed > 0
            ? ` — ${result.failed} falharam (veja abaixo)`
            : ""}
        </Title>
      </Card.Root>
      <div className="grid grid-cols-4 gap-8">
        <StatCard
          label="Produtos novos"
          value={result.productsCreated}
          tone="green"
        />
        <StatCard
          label="Atualizados"
          value={result.productsReused}
          tone="muted"
        />
        <StatCard
          label="Preços gravados"
          value={result.pricesSet}
          tone="green"
        />
        <StatCard label="Com erro" value={result.failed} tone="red" />
      </div>
      {result.attention > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {result.attention} produto(s) entraram marcados como “Precisa de
              atenção” (produto novo, múltiplo assumido ou sem preço). Eles
              aparecem com a tag na listagem; editar e salvar o produto remove a
              marcação.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {result.errors.length > 0 && (
        <>
          <Title variant="body-sm" weight="medium" className="pt-4">
            Linhas com erro e motivo
          </Title>
          <Card.Root
            isCompact
            className="flex max-h-[320px] flex-col gap-4 overflow-y-auto"
          >
            {result.errors.map((err) => (
              <Title key={`${err.row}-${err.sku}`} variant="caption">
                <Title
                  variant="caption"
                  color="red"
                  weight="medium"
                  className="inline"
                >
                  Linha {err.row}
                </Title>
                {err.sku ? ` (SKU ${err.sku})` : ""} — {err.message}
              </Title>
            ))}
          </Card.Root>
        </>
      )}
    </div>
  );
}
