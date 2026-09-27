"use client";

import { Alert } from "@/components/Alert";
import { Grid } from "@/components/Grid";
import { Progress } from "@/components/Progress";
import { StatCard } from "@/components/StatCard";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { CheckCircle2 } from "lucide-react";

import { HistoryResult, RowProblem } from "../../interface";
import { ReviewList } from "../ReviewList";

interface Props {
  result: HistoryResult | null;
  localProblems: RowProblem[];
  progress: { done: number; total: number } | null;
  running: boolean;
}

export function StepReview({
  result,
  localProblems,
  progress,
  running,
}: Props) {
  if (running && progress) {
    return (
      <div className="flex flex-col gap-8">
        <Title variant="body-sm" color="muted">
          Lendo os pedidos… parte {progress.done} de {progress.total}.
        </Title>
        <Progress value={(progress.done / Math.max(progress.total, 1)) * 100} />
      </div>
    );
  }
  if (!result) return null;

  const done = !result.dryRun;
  const problems = [...localProblems, ...result.issues]
    .sort((a, b) => a.row - b.row)
    .map((p) => `Linha ${p.row}: ${p.message}`);

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={4}
        total={4}
        title={done ? "Histórico importado" : "Confira antes de importar"}
      >
        {done
          ? "Os pedidos entraram como entregues, sem comissão nem boleto. O estoque estimado e a rotina desses clientes já foram recalculados."
          : "Nada foi gravado ainda. Veja o que vai entrar e o que fica de fora; se estiver certo, clique em Importar."}
      </Stepper.Intro>
      {done && (
        <Alert.Root variant="success">
          <Alert.Icon icon={CheckCircle2} />
          <Alert.Content>
            <Alert.Description>
              {result.ordersCreated} pedido(s) importado(s).
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <Grid.Root cols={{ base: 2, desktop: 4 }} gap={12}>
        <StatCard
          label={done ? "Pedidos importados" : "Pedidos que entram"}
          value={result.ordersCreated}
          tone="green"
        />
        <StatCard label="Itens" value={result.itemsImported} />
        <StatCard
          label="Já importados antes"
          value={result.ordersAlreadyImported}
        />
        <StatCard label="Vínculos novos" value={result.linksCreated} />
      </Grid.Root>
      <ReviewList
        title={`${result.missingClients.length} cliente(s) fora da carteira`}
        hint="Os pedidos destes clientes ficam de fora. Importe os clientes em Clientes → Importar e depois suba esta planilha de novo: o que já entrou não duplica."
        items={result.missingClients.map(
          (c) => `${c.document} · ${c.rows} linha(s)`
        )}
      />
      <ReviewList
        title={`${result.missingProducts.length} produto(s) fora do catálogo`}
        hint="Estes itens ficam de fora (o resto do pedido entra). Importe a tabela da fábrica antes, se quiser trazê-los."
        items={result.missingProducts.map(
          (p) =>
            `${[p.code, p.name].filter(Boolean).join(" — ")} (${factoryName(p.factory)}) · ${p.rows} linha(s)`
        )}
      />
      <ReviewList
        title={`${problems.length} linha(s) com problema`}
        items={problems}
      />
    </div>
  );
}
