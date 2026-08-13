"use client";

import { Title } from "@/components/Title";
import { PlatformRetention } from "../../interface";
import { RETENTION_TONE_CLASS, retentionTone } from "../../utils";

/**
 * A curva média, antes da grade.
 *
 * A grade responde por turma; esta linha responde pela plataforma: de cada cem
 * empresas que entram, quantas ainda estão operando um mês depois, dois, três.
 * É o número que se compara com o mês passado para saber se alguma mudança no
 * produto funcionou.
 */
export function RetentionSummary({
  retention,
}: {
  retention: PlatformRetention;
}) {
  // O primeiro ponto é o mês de entrada — informação de ativação, não de
  // permanência. A curva que interessa começa no mês seguinte.
  //
  // Os nulos caem fora: são meses de vida que nenhuma turma alcançou ainda, e
  // mostrá-los como 0% diria que ninguém ficou onde nada aconteceu.
  const points = retention.overall
    .slice(1, 7)
    .filter((percent): percent is number => percent !== null);

  if (points.length === 0) {
    return (
      <Title variant="micro" color="muted">
        Ainda não há turma com um mês completo de vida — a curva média aparece
        quando a primeira delas completar o mês seguinte ao da entrada.
      </Title>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Title variant="micro" color="muted">
        Média de todas as turmas, ponderada pelo tamanho
      </Title>
      <div className="flex flex-wrap gap-8">
        {points.map((percent, index) => (
          <div
            key={index}
            className={`flex min-w-[76px] flex-col gap-[2px] rounded-[6px] px-12 py-8 ${
              RETENTION_TONE_CLASS[retentionTone(Math.round(percent))]
            }`}
          >
            <Title variant="micro">{index + 1}º mês</Title>
            <Title variant="body-sm" weight="semibold">
              {Math.round(percent)}%
            </Title>
          </div>
        ))}
      </div>
    </div>
  );
}
