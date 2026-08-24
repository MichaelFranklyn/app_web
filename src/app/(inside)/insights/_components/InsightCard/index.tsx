"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/format/masks";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Insight, InsightSample } from "../../interface";
import { GROUP_LABEL, INSIGHT_COPY, InsightTone } from "../../utils";

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
export function InsightCard({ insight }: { insight: Insight }) {
  const copy = INSIGHT_COPY[insight.kind];
  const skin = TONE[copy.tone];
  const Icon = copy.icon;
  const { navigateTo, isPending } = useNavigation();
  const money = Number(insight.amount ?? 0);

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
              {insight.count}
            </Title>
            <Title variant="micro" color="muted">
              {insight.count === 1 ? "caso" : "casos"}
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
            {insight.samples.map((sample) => (
              <SampleChip key={sample.id} sample={sample} />
            ))}
            {insight.count > insight.samples.length && (
              <Title variant="micro" color="muted">
                e mais {insight.count - insight.samples.length}
              </Title>
            )}
          </div>
        )}

        {/* `mt-auto`: a ação encosta no rodapé do cartão, então os botões da
            fileira ficam na mesma linha mesmo com textos de alturas diferentes. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-8 border-t border-(--border) pt-12">
          <Title variant="micro" color="muted">
            {money > 0 ? formatMoney(money) : " "}
          </Title>
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
      </Card.Body>
    </Card.Root>
  );
}
