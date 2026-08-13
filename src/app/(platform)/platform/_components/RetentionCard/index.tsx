"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { PlatformRetention } from "../../interface";
import {
  RETENTION_TONE_CLASS,
  cohortLabel,
  isPartialCell,
  retentionPercent,
  retentionTone,
} from "../../utils";
import { RetentionSummary } from "./RetentionSummary";

/**
 * Quem entra, fica?
 *
 * O gráfico de crescimento conta quem chegou; esta grade conta quem ficou. São
 * perguntas diferentes e a resposta pode ser oposta — dez empresas novas por
 * mês com nove saindo é uma linha subindo lá e uma plataforma morrendo aqui.
 *
 * Lê-se na HORIZONTAL para acompanhar o destino de uma turma, e na VERTICAL
 * para comparar turmas na mesma idade: se a coluna M1 melhora de cima para
 * baixo, o produto está segurando melhor quem entra agora do que segurava antes.
 *
 * A grade rola na horizontal de propósito — é uma matriz de doze meses, e
 * espremer as colunas para caber tiraria dela justamente o formato da mancha,
 * que é como se lê.
 */
export function RetentionCard({ retention }: { retention: PlatformRetention }) {
  const { cohorts, currentMonth } = retention;
  const longest = Math.max(0, ...cohorts.map((cohort) => cohort.values.length));

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Permanência por turma
        </Card.Header.Title>
        <Card.Header.Description>
          Cada linha é o grupo de empresas que entrou no mesmo mês. As colunas
          mostram quantas delas ainda lançavam pedido depois de 1, 2, 3 meses.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body className="flex flex-col gap-20">
        {cohorts.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <Users size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>
              Nenhuma empresa entrou no período
            </EmptyState.Title>
            <EmptyState.Description>
              Sem turmas para acompanhar. A grade aparece a partir da primeira
              empresa criada.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <>
            <RetentionSummary retention={retention} />

            <div className="overflow-x-auto">
              {/* Largura pelo conteúdo, não pela tela: com uma turma só, o
                  `w-full` esticava a única célula por toda a linha e a grade
                  perdia a forma que a torna legível. */}
              <table className="w-auto border-separate border-spacing-[3px] text-left">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-(--bg2) pr-8">
                      <Title variant="micro" color="muted">
                        Turma
                      </Title>
                    </th>
                    <th className="pr-8">
                      <Title variant="micro" color="muted">
                        Empresas
                      </Title>
                    </th>
                    {Array.from({ length: longest }, (_, index) => (
                      <th key={index} className="min-w-[52px] text-center">
                        <Title variant="micro" color="muted">
                          {index === 0 ? "Entrada" : `${index}º mês`}
                        </Title>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {cohorts.map((cohort) => (
                    <tr key={cohort.cohort}>
                      <th className="sticky left-0 bg-(--bg2) pr-8 text-left">
                        <Title variant="body-sm" weight="semibold">
                          {cohortLabel(cohort.cohort)}
                        </Title>
                      </th>
                      <td className="pr-8">
                        <Title variant="body-sm" color="muted">
                          {cohort.companies}
                        </Title>
                      </td>

                      {cohort.values.map((active, offset) => {
                        const percent = retentionPercent(
                          active,
                          cohort.companies
                        );
                        const partial = isPartialCell(
                          cohort.cohort,
                          offset,
                          currentMonth
                        );
                        return (
                          <td
                            key={offset}
                            className={cn(
                              "rounded-[4px] px-8 py-[6px] text-center",
                              RETENTION_TONE_CLASS[retentionTone(percent)],
                              // O mês corrente está pela metade: sem a marca, a
                              // diagonal final da grade se leria como queda
                              // geral em vez de mês inacabado.
                              partial &&
                                "opacity-55 outline-1 outline-(--border) outline-dashed"
                            )}
                            title={
                              partial
                                ? `${active} de ${cohort.companies} — mês em andamento`
                                : `${active} de ${cohort.companies}`
                            }
                          >
                            <Title variant="caption" weight="semibold">
                              {percent}%
                            </Title>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Title variant="micro" color="muted">
              Célula tracejada = mês ainda em andamento, contagem incompleta.
              &quot;Ficar&quot; aqui é ter lançado pedido no mês; uma empresa
              que passou um mês parada e voltou volta a contar.
            </Title>
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
