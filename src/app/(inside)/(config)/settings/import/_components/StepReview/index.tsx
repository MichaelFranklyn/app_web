"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Progress } from "@/components/Progress";
import { Card } from "@/components/Card";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { CheckCircle2, PackagePlus } from "lucide-react";

import { HistoryResult, RowProblem } from "../../interface";
import { missingProductsAmount } from "../../utils";
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
  /** Refaz a conferência cadastrando os produtos fora do catálogo. */
  onIncludeMissingProducts?: () => void;
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
  onIncludeMissingProducts,
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
  const lostAmount = missingProductsAmount(result);
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
        hint={
          lostAmount > 0
            ? `Estes itens ficam de fora e os pedidos somam ${formatMoney(lostAmount)} a menos do que na planilha (o resto do pedido entra). Cadastre-os aqui: entram com o nome e o código da planilha e a marca "Precisa de atenção", e a tabela da fábrica completa depois.`
            : 'Estes itens ficam de fora (o resto do pedido entra). Cadastre-os aqui: entram com o nome e o código da planilha e a marca "Precisa de atenção", e a tabela da fábrica completa depois.'
        }
        items={result.missingProducts.map((p) => {
          const label = `${[p.code, p.name].filter(Boolean).join(" — ")} (${factoryName(p.factory)})`;
          const amount = Number(p.amount);
          return `${label} · ${plural(p.rows, "item", "itens")}${amount > 0 ? ` · ${formatMoney(amount)}` : ""}`;
        })}
        action={
          !done &&
          onIncludeMissingProducts && (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="sm"
              onClick={onIncludeMissingProducts}
            >
              <Button.Icon icon={PackagePlus} />
              <Button.Title>
                {`Cadastrar ${result.missingProducts.length === 1 ? "este produto" : `estes ${result.missingProducts.length} produtos`} e incluir`}
              </Button.Title>
            </Button.Root>
          )
        }
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
