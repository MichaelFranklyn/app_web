"use client";

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
    <div className="flex w-[300px] flex-col">
      <div className="border-b border-(--border) px-[12px] py-[10px]">
        <Title variant="label">{title}</Title>
      </div>

      {/* A leitura dos números vem antes da explicação: quem abre o "?" quer
          primeiro saber o que ESTE gráfico está dizendo hoje. */}
      {insight && (
        <div className="flex flex-col gap-4 border-b border-(--border) bg-(--bg3) px-[12px] py-[10px]">
          <Title variant="micro" color="muted">
            O que esses números dizem
          </Title>
          <Title variant="body-sm">{insight.text}</Title>
          {insight.note && (
            <Title variant="micro" color="muted2">
              {insight.note}
            </Title>
          )}
        </div>
      )}

      <div className="flex flex-col gap-10 px-[12px] py-[10px]">
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
      </div>
    </div>
  );

  return (
    <Tooltip
      open={open}
      onOpenChange={setOpen}
      content={content}
      className="max-w-none p-0 whitespace-normal"
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`O que o gráfico "${title}" está mostrando`}
        className="flex size-24 shrink-0 cursor-help items-center justify-center rounded-full text-(--muted) transition-colors hover:bg-(--bg3) hover:text-(--text) focus-visible:ring-2 focus-visible:ring-(--border2) focus-visible:outline-none"
      >
        <Info size={15} aria-hidden />
      </button>
    </Tooltip>
  );
}
