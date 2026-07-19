import { Alert } from "@/components/Alert";
import { StatCard } from "@/components/StatCard";
import { Title } from "@/components/Title";
import { CheckCircle2, Info } from "lucide-react";

import { ImportResult, SkippedImportItem } from "./interface";

interface StepResultProps {
  result: ImportResult;
  /** Itens que o arquivo trouxe mas ficaram de fora (fora do catálogo/sem nível). */
  skipped: SkippedImportItem[];
}

export function StepResult({ result, skipped }: StepResultProps) {
  const partial = result.failed > 0 || skipped.length > 0;
  return (
    <div className="flex flex-col gap-12">
      <Alert.Root variant={partial ? "warning" : "success"}>
        <Alert.Icon icon={partial ? Info : CheckCircle2} />
        <Alert.Content>
          <Alert.Title>
            {partial ? "Importação parcial" : "Itens importados"}
          </Alert.Title>
          <Alert.Description>
            {result.created} item(ns) gravado(s) no pedido
            {result.failed > 0 ? ` · ${result.failed} com erro` : ""}
            {skipped.length > 0
              ? ` · ${skipped.length} não importado(s) (fora do catálogo)`
              : ""}
            .
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <div
        className={`grid gap-8 ${skipped.length > 0 ? "grid-cols-3" : "grid-cols-2"}`}
      >
        <StatCard label="Gravados" value={result.created} tone="green" />
        <StatCard label="Com erro" value={result.failed} tone="red" />
        {skipped.length > 0 && (
          <StatCard
            label="Não importados"
            value={skipped.length}
            tone="amber"
          />
        )}
      </div>
      {result.errors.length > 0 && (
        <div className="flex max-h-[260px] flex-col gap-4 overflow-y-auto">
          {result.errors.map((err) => (
            <Title key={`${err.index}-${err.sku}`} variant="caption">
              <Title
                variant="caption"
                color="red"
                weight="medium"
                className="inline"
              >
                Linha {err.index}
              </Title>
              {err.sku ? ` (${err.sku})` : ""} — {err.message}
            </Title>
          ))}
        </div>
      )}
      {skipped.length > 0 && (
        <div className="flex flex-col gap-4">
          <Title variant="caption" weight="medium" color="secondary">
            Itens não importados
          </Title>
          <div className="flex max-h-[260px] flex-col gap-4 overflow-y-auto">
            {skipped.map((item) => (
              <Title key={item.sku} variant="caption">
                <Title
                  variant="caption"
                  color="amber"
                  weight="medium"
                  className="inline"
                >
                  {item.sku}
                </Title>
                {item.name ? ` (${item.name})` : ""} — {item.reason}
              </Title>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
