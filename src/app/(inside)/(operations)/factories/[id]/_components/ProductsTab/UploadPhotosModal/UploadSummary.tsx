"use client";

import { Progress } from "@/components/Progress";
import { Title } from "@/components/Title";

interface Stats {
  total: number;
  matched: number;
  unmatched: number;
  duplicated: number;
}

interface Props {
  stats: Stats;
  /** Quantas fotos já foram enviadas — o envio vai em lotes. */
  sent: number;
  isLoading: boolean;
}

/**
 * Placar da leva: quantas fotos entraram, quantas casaram e o que exige atenção.
 *
 * Durante o envio vira barra de progresso, porque cinquenta fotos levam alguns
 * segundos e um botão só girando não diz se está andando.
 */
export function UploadSummary({ stats, sent, isLoading }: Props) {
  if (stats.total === 0) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Title variant="caption" color="muted">
          Enviando {sent} de {stats.matched} foto(s)…
        </Title>
        <Progress value={stats.matched ? (sent / stats.matched) * 100 : 0} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Title variant="body-sm">
        {stats.total} foto(s) escolhida(s) · {stats.matched} pronta(s) para
        salvar
      </Title>
      {stats.unmatched > 0 && (
        <Title variant="caption" color="amber">
          {stats.unmatched} sem produto correspondente — escolha o produto ou
          remova a foto.
        </Title>
      )}
      {stats.duplicated > 0 && (
        <Title variant="caption" color="amber">
          {stats.duplicated} produto(s) com mais de uma foto apontada.
        </Title>
      )}
    </div>
  );
}
