"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/format/masks";
import { ArrowRight, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Insight, InsightSample } from "../../interface";
import {
  cardCount,
  caseTotal,
  GROUP_LABEL,
  INSIGHT_COPY,
  InsightTone,
  toneOf,
} from "../../utils";
import { InsightCasesModal } from "../InsightCasesModal";

/**
 * O tom vira cor em três pontos do cartão — faixa, ícone e número —, sempre o
 * mesmo. É o que deixa a tela ser lida na diagonal: vermelho custa dinheiro
 * hoje, âmbar trava o mês, azul é o pano de fundo.
 */
const TONE: Record<InsightTone, { rail: string; chip: string; value: string }> =
  {
    urgent: {
      rail: "bg-(--red)",
      chip: "bg-(--red-bg) text-(--red)",
      value: "text-(--red)",
    },
    attention: {
      rail: "bg-(--amber)",
      chip: "bg-(--amber-bg2) text-(--amber)",
      value: "text-(--amber)",
    },
    info: {
      rail: "bg-(--blue)",
      chip: "bg-(--blue-bg) text-(--blue)",
      value: "text-(--blue)",
    },
  };

/** Um exemplo do insight: vira link quando o registro tem tela própria. */
function SampleChip({ sample }: { sample: InsightSample }) {
  const body = (
    <>
      {sample.label}
      {sample.detail && (
        <span className="font-(--weight-regular) text-(--muted)">
          {" "}
          · {sample.detail}
        </span>
      )}
    </>
  );
  const className =
    "rounded-(--r-sm) border border-(--border) bg-(--bg3) px-8 py-[3px]";

  return sample.link ? (
    <Link
      href={sample.link}
      className={cn(
        className,
        "transition-colors hover:border-(--border2) hover:bg-(--bg4)"
      )}
    >
      <Title variant="micro" weight="semibold">
        {body}
      </Title>
    </Link>
  ) : (
    <span className={className}>
      <Title variant="micro" weight="semibold">
        {body}
      </Title>
    </span>
  );
}

/**
 * Uma pendência: quantos casos, o que é, POR QUE atrapalha a venda, de quem
 * estamos falando e o caminho para resolver.
 *
 * O "por quê" não é enfeite — é a diferença entre um número que se ignora e uma
 * decisão. "23 clientes atrasados" não move ninguém; "cada um já deveria ter
 * comprado, e quem repõe a prateleira dele é o concorrente" move.
 */
export function InsightCard({
  insight,
  sellerId,
}: {
  insight: Insight;
  /** O vendedor escolhido no topo — o modal precisa do mesmo recorte. */
  sellerId: string | null;
}) {
  const copy = INSIGHT_COPY[insight.kind];
  const skin = TONE[toneOf(insight)];
  const Icon = copy.icon;
  const { navigateTo, isPending } = useNavigation();
  const money = Number(insight.amount ?? 0);
  const big = cardCount(insight);
  const total = caseTotal(insight);
  const hidden = total - insight.samples.length;
  const [showCases, setShowCases] = useState(false);

  return (
    <Card.Root className="relative h-full overflow-hidden">
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-[3px]", skin.rail)}
      />

      <Card.Body className="flex h-full flex-col gap-12">
        <div className="flex items-start justify-between gap-12">
          <div className="flex items-start gap-10">
            <span
              aria-hidden
              className={cn(
                "flex size-32 shrink-0 items-center justify-center rounded-(--r-md)",
                skin.chip
              )}
            >
              <Icon size={16} />
            </span>
            <div className="flex flex-col gap-4">
              <Badge.Root appearance="tinted" color="neutral" size="xs">
                <Badge.Text>{GROUP_LABEL[insight.group]}</Badge.Text>
              </Badge.Root>
            </div>
          </div>

          {/* O número grande à direita: é o tamanho do problema, e é ele que
              faz a fileira de cartões ser comparável de relance. */}
          <div className="flex shrink-0 flex-col items-end">
            <Title
              variant="kpi"
              className={cn("text-[27px]", skin.value)}
              aria-hidden
            >
              {big.value}
            </Title>
            <Title variant="micro" color="muted">
              {big.label}
            </Title>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Title variant="heading-sm">{copy.title(insight)}</Title>
          {/* O porquê, por extenso: é o que a pessoa veio buscar aqui. */}
          <Title variant="body-sm" color="secondary">
            {copy.why(insight)}
          </Title>
        </div>

        {insight.samples.length > 0 && (
          <div className="flex flex-wrap items-center gap-6">
            {/* A chave leva o ÍNDICE porque `sample.id` não é único, e não
                por acidente: ele é o id do registro que o caso aponta (o
                cliente, a fábrica, o pedido), e o mesmo registro aparece
                legitimamente duas vezes — duas metas atrasadas da mesma
                fábrica são de vendedores diferentes, e dois vínculos fora da
                rotina podem ser do mesmo cliente em fábricas diferentes.
                O índice é seguro aqui: a lista vem ordenada do servidor e é
                substituída inteira a cada leitura, nunca reordenada no
                cliente. */}
            {insight.samples.map((sample, index) => (
              <SampleChip key={`${sample.id}-${index}`} sample={sample} />
            ))}
            {/* O "e mais N" era um beco: dizia que havia mais e não deixava
                ver. Agora é o botão que abre a lista inteira. */}
            {hidden > 0 && (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="xs"
                noUppercase
                onClick={() => setShowCases(true)}
              >
                <Button.Title>e mais {hidden}</Button.Title>
              </Button.Root>
            )}
          </div>
        )}

        {/* `mt-auto`: a ação encosta no rodapé do cartão, então os botões da
            fileira ficam na mesma linha mesmo com textos de alturas diferentes. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-8 border-t border-(--border) pt-12">
          <Title variant="micro" color="muted">
            {money > 0 ? formatMoney(money) : " "}
          </Title>
          <div className="flex flex-wrap items-center gap-8">
            {/* Ver a lista completa vale mesmo quando ela cabe nas três
                amostras: é onde está o MOTIVO de cada caso. */}
            {total > 0 && (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="sm"
                noUppercase
                onClick={() => setShowCases(true)}
              >
                <Button.Icon icon={List} />
                <Button.Title>Ver todos</Button.Title>
              </Button.Root>
            )}
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              noUppercase
              disabled={isPending}
              onClick={() => navigateTo(copy.href)}
            >
              <Button.Title>{copy.action}</Button.Title>
              <Button.Icon icon={ArrowRight} />
            </Button.Root>
          </div>
        </div>
      </Card.Body>

      <InsightCasesModal
        insight={insight}
        sellerId={sellerId}
        open={showCases}
        onOpenChange={setShowCases}
      />
    </Card.Root>
  );
}
