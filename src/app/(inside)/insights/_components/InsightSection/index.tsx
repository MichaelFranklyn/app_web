"use client";

import { Grid } from "@/components/Grid";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";

import { Insight } from "../../interface";
import { InsightTone, TONE_SECTION } from "../../utils";
import { InsightCard } from "../InsightCard";

const DOT: Record<InsightTone, string> = {
  urgent: "bg-(--red)",
  attention: "bg-(--amber)",
  info: "bg-(--blue)",
};

interface Props {
  tone: InsightTone;
  insights: Insight[];
  /** O vendedor escolhido no topo — segue até o modal de cada cartão. */
  sellerId: string | null;
}

/**
 * Uma faixa de urgência da tela: "Resolver hoje", "Esta semana", "De olho".
 *
 * A pergunta que traz alguém aqui não é "o que existe", é "o que eu faço
 * primeiro" — e uma pilha uniforme de cartões não responde isso. Faixa sem
 * nenhum caso simplesmente não aparece: título com lista vazia ensina a rolar
 * a tela sem ler.
 */
export function InsightSection({ tone, insights, sellerId }: Props) {
  if (insights.length === 0) return null;

  const section = TONE_SECTION[tone];

  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-wrap items-baseline gap-8">
        <span
          aria-hidden
          className={cn("size-8 shrink-0 rounded-full", DOT[tone])}
        />
        <Title variant="heading-sm">{section.title}</Title>
        <Title variant="micro" color="muted">
          {insights.length} {insights.length === 1 ? "pendência" : "pendências"}{" "}
          · {section.hint}
        </Title>
      </div>

      <Grid.Root cols={{ base: 1, "desktop-xl": 2 }} gap={16}>
        {insights.map((insight) => (
          <Grid.Item key={insight.kind}>
            <InsightCard insight={insight} sellerId={sellerId} />
          </Grid.Item>
        ))}
      </Grid.Root>
    </section>
  );
}
