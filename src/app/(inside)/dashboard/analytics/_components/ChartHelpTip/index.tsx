"use client";
import { Button } from "@/components/Button";
import { TooltipPanel } from "@/components/TooltipPanel";

import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { Info } from "lucide-react";
import { useState } from "react";

import { ChartInsight } from "../../chartInsight";
import { ChartHelp } from "../../interface";

interface Props {
  /** Título do gráfico; repetido no topo do balão para dar contexto. */
  title: string;
  help: ChartHelp;
  /** Leitura dos números que estão na tela; null quando não dá para afirmar. */
  insight?: ChartInsight | null;
}

const BLOCKS = [
  { key: "what", label: "O que mostra" },
  { key: "read", label: "Como ler" },
  { key: "watch", label: "Fique de olho" },
] as const;

/**
 * O "?" ao lado do título do gráfico: explica em texto simples o que aquele
 * desenho está dizendo.
 *
 * É controlado (open no estado) por causa do toque: o Radix só abre tooltip com
 * mouse ou teclado, e no celular/tablet o usuário toca. O onClick abre — e roda
 * depois do pointerdown com que o Radix fecharia, então o toque ganha.
 */
export function ChartHelpTip({ title, help, insight }: Props) {
  const [open, setOpen] = useState(false);

  const content = (
    <TooltipPanel.Root>
      <TooltipPanel.Header>{title}</TooltipPanel.Header>

      {/* A leitura dos números vem antes da explicação: quem abre o "?" quer
          primeiro saber o que ESTE gráfico está dizendo hoje. */}
      {insight && (
        <TooltipPanel.Section muted className="gap-4">
          <Title variant="micro" color="muted">
            O que esses números dizem
          </Title>
          <Title variant="body-sm">{insight.text}</Title>
          {insight.note && (
            <Title variant="micro" color="muted2">
              {insight.note}
            </Title>
          )}
        </TooltipPanel.Section>
      )}

      <TooltipPanel.Section className="gap-10">
        {BLOCKS.map((block) => (
          <div key={block.key} className="flex flex-col gap-2">
            <Title variant="micro" color="muted">
              {block.label}
            </Title>
            <Title variant="body-sm" color="secondary">
              {help[block.key]}
            </Title>
          </div>
        ))}
      </TooltipPanel.Section>
    </TooltipPanel.Root>
  );

  return (
    <Tooltip open={open} onOpenChange={setOpen} content={content} panel>
      <Button.Root
        appearance="ghost"
        color="neutral"
        size="xs"
        isIconOnly
        label={`O que o gráfico "${title}" está mostrando`}
        className="cursor-help rounded-full text-(--muted) hover:text-(--text)"
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={Info} />
      </Button.Root>
    </Tooltip>
  );
}
