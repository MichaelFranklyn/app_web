import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";

import { Title } from "@/components/Title";
import { plural, pluralWord } from "@/utils/format/plural";
import { Info } from "lucide-react";

import { ImportPriceListResult } from "./interface";

export function ResultView({ result }: { result: ImportPriceListResult }) {
  const imported = result.totalRows - result.failed;
  return (
    <div className="flex flex-col gap-8">
      {/* Reconciliação principal: responde "todas as linhas subiram?" de forma direta. */}
      <Card.Root inset>
        <Card.Body padding="sm" className="flex-row items-baseline">
          <Title
            variant="heading-sm"
            weight="bold"
            color={result.failed > 0 ? "amber" : "green"}
          >
            {imported} de {result.totalRows}
          </Title>
          <Title variant="body-sm" color="muted">
            {pluralWord(
              result.totalRows,
              "linha enviada gravada",
              "linhas enviadas gravadas"
            )}
            {result.failed > 0
              ? ` — ${result.failed} falharam (veja abaixo)`
              : ""}
          </Title>
        </Card.Body>
      </Card.Root>
      <Card.Kpi.Group>
        <Card.Kpi>
          <Card.Kpi.Label>Produtos novos</Card.Kpi.Label>
          <Card.Kpi.Value>{result.productsCreated}</Card.Kpi.Value>
        </Card.Kpi>
        <Card.Kpi>
          <Card.Kpi.Label>Atualizados</Card.Kpi.Label>
          <Card.Kpi.Value>{result.productsReused}</Card.Kpi.Value>
        </Card.Kpi>
        <Card.Kpi>
          <Card.Kpi.Label>Preços gravados</Card.Kpi.Label>
          <Card.Kpi.Value>{result.pricesSet}</Card.Kpi.Value>
        </Card.Kpi>
        <Card.Kpi>
          <Card.Kpi.Label>Com erro</Card.Kpi.Label>
          <Card.Kpi.Value status={result.failed > 0 ? "urgente" : "neutral"}>
            {result.failed}
          </Card.Kpi.Value>
        </Card.Kpi>
      </Card.Kpi.Group>
      {result.attention > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {plural(
                result.attention,
                "produto entrou marcado",
                "produtos entraram marcados"
              )}{" "}
              como “Precisa de atenção” (produto novo, múltiplo assumido ou sem
              preço).{" "}
              {pluralWord(result.attention, "Ele aparece", "Eles aparecem")} com
              a tag na listagem; editar e salvar o produto remove a marcação.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {result.errors.length > 0 && (
        <>
          <Title variant="body-sm" weight="medium" className="pt-4">
            Linhas com erro e motivo
          </Title>
          <Card.Root inset>
            <Card.Body padding="sm" className="max-h-[320px] overflow-y-auto">
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
                  {err.sku ? ` (Código ${err.sku})` : ""} — {err.message}
                </Title>
              ))}
            </Card.Body>
          </Card.Root>
        </>
      )}
    </div>
  );
}
