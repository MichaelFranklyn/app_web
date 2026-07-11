import { Alert } from "@/components/Alert";
import { StatCard } from "@/components/StatCard";
import { Title } from "@/components/Title";
import { CheckCircle2, Info } from "lucide-react";

import { ImportResult } from "./interface";

interface StepResultProps {
  result: ImportResult;
}

export function StepResult({ result }: StepResultProps) {
  return (
    <div className="flex flex-col gap-12">
      <Alert.Root variant={result.failed > 0 ? "warning" : "success"}>
        <Alert.Icon icon={result.failed > 0 ? Info : CheckCircle2} />
        <Alert.Content>
          <Alert.Title>
            {result.failed > 0 ? "Importação parcial" : "Itens importados"}
          </Alert.Title>
          <Alert.Description>
            {result.created} item(ns) gravado(s) no pedido
            {result.failed > 0 ? ` · ${result.failed} com erro` : ""}.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <div className="grid grid-cols-2 gap-8">
        <StatCard label="Gravados" value={result.created} tone="green" />
        <StatCard label="Com erro" value={result.failed} tone="red" />
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
    </div>
  );
}
