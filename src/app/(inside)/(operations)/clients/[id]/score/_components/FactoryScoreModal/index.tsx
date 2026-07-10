"use client";

import { Card } from "@/components/Card";
import { DividerRoot } from "@/components/Divider/Root";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import { Progress } from "@/components/Progress";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { explainScore, scoreBarColor } from "@/utils/score";
import { History } from "lucide-react";
import { FactoryVisitScore } from "../../../interface";
import { ScoreBars } from "../ScoreBars";
import { ScoreReasonsList } from "../ScoreReasonsList";
import { SuggestedProductsList } from "../SuggestedProductsList";
import { useFactoryScoreDetail } from "./useFactoryScoreDetail";

interface Props {
  score: FactoryVisitScore | null;
  onClose: () => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-10">
      <Title variant="label" color="secondary">
        {title}
      </Title>
      {children}
    </div>
  );
}

/**
 * Por que ESTA fábrica tem este score: a decomposição, os motivos com o que
 * fazer, os produtos que provavelmente precisam de reposição e o histórico.
 */
export function FactoryScoreModal({ score, onClose }: Props) {
  const linkId = score?.clientFactoryLink?.id ?? null;
  const { history, insights, loading } = useFactoryScoreDetail(linkId);

  if (!score) return null;

  const { total, level, reasons } = explainScore(score);
  const factoryName = score.clientFactoryLink?.factory?.nomeFantasia ?? "—";

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content size="2xl">
        <Modal.Header
          title={`${factoryName} — Score ${total.toFixed(0)}`}
          description={level.summary}
        />
        <Modal.Body>
          <div className="flex flex-col gap-20">
            <Section title={`Como chegamos a ${total.toFixed(0)}`}>
              <ScoreBars score={score} />
              <DividerRoot />
              <div className="flex items-center gap-10">
                <Title
                  variant="kpi"
                  color={scoreBarColor(total)}
                  className="text-[44px]"
                >
                  {total.toFixed(0)}
                </Title>
                <Title variant="caption">
                  Score total ponderado, calculado em{" "}
                  {formatDate(score.scoreDate)}
                </Title>
              </div>
            </Section>

            <Section title="Por que este score">
              <ScoreReasonsList reasons={reasons} />
            </Section>

            <Section title="Produtos sugeridos para a visita">
              {loading ? (
                <Loading.Skeleton className="h-[96px] w-full" />
              ) : (
                <Card.Root>
                  <Card.Body padding="compact">
                    <SuggestedProductsList insights={insights} />
                  </Card.Body>
                </Card.Root>
              )}
            </Section>

            <Section title="Histórico do score nesta fábrica">
              {loading ? (
                <Loading.Skeleton className="h-[96px] w-full" />
              ) : history.length === 0 ? (
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <History size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Sem histórico</EmptyState.Title>
                  <EmptyState.Description>
                    O histórico aparece após o primeiro cálculo.
                  </EmptyState.Description>
                </EmptyState.Root>
              ) : (
                <Card.Root>
                  <Card.Body padding="compact">
                    {history.map((entry) => {
                      const value = parseFloat(entry.scoreTotal) || 0;
                      return (
                        <Card.Item key={entry.id}>
                          <Card.Item.Info>
                            <Card.Item.Info.Name>
                              {formatDate(entry.scoreDate)}
                            </Card.Item.Info.Name>
                          </Card.Item.Info>
                          <Card.Item.Action>
                            <Progress.Value color={scoreBarColor(value)}>
                              {value.toFixed(0)}
                            </Progress.Value>
                          </Card.Item.Action>
                        </Card.Item>
                      );
                    })}
                  </Card.Body>
                </Card.Root>
              )}
            </Section>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
