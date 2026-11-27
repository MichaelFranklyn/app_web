"use client";

import { Alert } from "@/components/Alert";
import { Progress } from "@/components/Progress";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { plural } from "@/utils/format/plural";
import { CheckCircle2 } from "lucide-react";

import { HistoryResult, RowProblem } from "../../interface";
import { ReviewList } from "../ReviewList";

interface Props {
  result: HistoryResult | null;
  localProblems: RowProblem[];
  progress: { done: number; total: number } | null;
  running: boolean;
  /** Posição no assistente (o de planilha tem 4 passos). */
  step?: number;
  total?: number;
  /** Como apontar a origem de um problema: "Linha 12", "pedido.pdf, item 3". */
  describeRow?: (row: number) => string;
}

const lineLabel = (row: number) => `Linha ${row}`;

export function StepReview({
  result,
  localProblems,
  progress,
  running,
  step = 4,
  total = 4,
  describeRow = lineLabel,
}: Props) {
  if (running && progress) {
    return (
      <div className="flex flex-col gap-8">
        <Title variant="body-sm" color="muted">
          Lendo os pedidos… parte {progress.done} de {progress.total}.
        </Title>
        <Progress
          value={(progress.done / Math.max(progress.total, 1)) * 100}
          label="Progresso da importação"
        />
      </div>
    );
  }
  if (!result) return null;

  const done = !result.dryRun;
  const problems = [...localProblems, ...result.issues]
    .sort((a, b) => a.row - b.row)
    .map((p) => `${describeRow(p.row)}: ${p.message}`);

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={step}
        total={total}
        title={done ? "Histórico importado" : "Confira antes de importar"}
      >
        {done
          ? "Os pedidos entraram no status em que estavam. Os faturados e entregues ganharam só as parcelas que ainda vão vencer, com a comissão delas. O estoque estimado e a rotina desses clientes já foram recalculados."
          : "Nada foi gravado ainda. Veja o que vai entrar e o que fica de fora; se estiver certo, clique em Importar."}
      </Stepper.Intro>
      {done && (
        <Alert.Root variant="success">
          <Alert.Icon icon={CheckCircle2} />
          <Alert.Content>
            <Alert.Description>
              {plural(
                result.ordersCreated,
                "pedido importado",
                "pedidos importados"
              )}
              .
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {/* Duas fileiras de quatro: o que entra e o que se cadastra no caminho.
          Sete cartões numa grade de quatro deixavam um buraco no fim. */}
      <div className="flex flex-col gap-8">
        <Title variant="micro" color="muted">
          {done ? "O que entrou" : "O que entra"}
        </Title>
        <Card.Kpi.Group size="compact">
          <Card.Kpi>
            <Card.Kpi.Label>Pedidos</Card.Kpi.Label>
            <Card.Kpi.Value>{result.ordersCreated}</Card.Kpi.Value>
          </Card.Kpi>
          <Card.Kpi>
            <Card.Kpi.Label>Itens</Card.Kpi.Label>
            <Card.Kpi.Value>{result.itemsImported}</Card.Kpi.Value>
          </Card.Kpi>
          <Card.Kpi>
            <Card.Kpi.Label>Parcelas a vencer</Card.Kpi.Label>
            <Card.Kpi.Value>{result.installmentsCreated}</Card.Kpi.Value>
          </Card.Kpi>
          <Card.Kpi>
            <Card.Kpi.Label help="Pedidos com o mesmo número já importados antes: não entram de novo.">
              Já importados antes
            </Card.Kpi.Label>
            <Card.Kpi.Value>{result.ordersAlreadyImported}</Card.Kpi.Value>
          </Card.Kpi>
        </Card.Kpi.Group>
      </div>
      <div className="flex flex-col gap-8">
        <Title variant="micro" color="muted">
          {done ? "O que foi cadastrado" : "O que é cadastrado"}
        </Title>
        <Card.Kpi.Group size="compact">
          <Card.Kpi>
            <Card.Kpi.Label>Clientes novos</Card.Kpi.Label>
            <Card.Kpi.Value>{result.clientsCreated}</Card.Kpi.Value>
          </Card.Kpi>
          <Card.Kpi>
            <Card.Kpi.Label>Produtos novos</Card.Kpi.Label>
            <Card.Kpi.Value>{result.productsCreated}</Card.Kpi.Value>
          </Card.Kpi>
          <Card.Kpi>
            <Card.Kpi.Label help="Vendedor × cliente × fábrica: é o que põe o cliente na rotina do vendedor.">
              Vínculos novos
            </Card.Kpi.Label>
            <Card.Kpi.Value>{result.linksCreated}</Card.Kpi.Value>
          </Card.Kpi>
          <Card.Kpi>
            <Card.Kpi.Label>Prazos novos</Card.Kpi.Label>
            <Card.Kpi.Value>{result.newPaymentTerms.length}</Card.Kpi.Value>
          </Card.Kpi>
        </Card.Kpi.Group>
      </div>
      <ReviewList
        title={`${plural(result.missingClients.length, "cliente", "clientes")} fora da carteira`}
        hint='Os pedidos destes clientes ficam de fora. Volte e ligue "Criar os clientes que faltam", ou importe os clientes em Clientes → Importar e importe de novo: o que já entrou não duplica.'
        items={result.missingClients.map(
          (c) => `${c.document} · ${plural(c.rows, "item", "itens")}`
        )}
      />
      <ReviewList
        title={`${plural(result.missingProducts.length, "produto", "produtos")} fora do catálogo`}
        hint='Estes itens ficam de fora (o resto do pedido entra). Volte e ligue "Criar os produtos que faltam", ou importe a tabela da fábrica antes.'
        items={result.missingProducts.map(
          (p) =>
            `${[p.code, p.name].filter(Boolean).join(" — ")} (${factoryName(p.factory)}) · ${plural(p.rows, "item", "itens")}`
        )}
      />
      <ReviewList
        title={
          done
            ? `${plural(result.newPaymentTerms.length, "prazo cadastrado", "prazos cadastrados")} na fábrica`
            : `${plural(result.newPaymentTerms.length, "prazo será cadastrado", "prazos serão cadastrados")} na fábrica`
        }
        hint="Vieram nos pedidos e a fábrica ainda não tinha. Os pedidos entram com eles; dá para ajustar depois na página da fábrica."
        items={result.newPaymentTerms.map(
          (t) => `${t.name} (${factoryName(t.factory)})`
        )}
      />
      <ReviewList
        title={plural(problems.length, "problema", "problemas")}
        items={problems}
      />
    </div>
  );
}
