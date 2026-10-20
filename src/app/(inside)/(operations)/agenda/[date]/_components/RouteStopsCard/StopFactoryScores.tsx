import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { getVisitScoreReasons } from "../../../utils";
import { VisitItem } from "../../interface";
import { factoryLabel } from "../../utils";

interface Props {
  stop: VisitItem;
}

/**
 * As empresas desta parada, cada uma com o próprio score.
 *
 * A parada mostrava só o nome de UMA fábrica, sem número: o vendedor via a
 * sequência do dia sem saber qual delas está pedindo a visita e qual está
 * apenas de carona — a mesma informação que o painel de detalhe já dava, mas
 * atrás de um clique por parada.
 *
 * O score é o de HOJE (`latestVisitScore`), o mesmo que o card da semana e o
 * painel explicam — por isso reusa `getVisitScoreReasons`, que já ordena da
 * empresa mais urgente para a menos e cai no vínculo principal nas visitas
 * antigas, geradas antes de o foco existir.
 */
export function StopFactoryScores({ stop }: Props) {
  const scored = getVisitScoreReasons(stop);

  // Sem score calculado (job ainda não rodou, vínculo desativado) a linha volta
  // a ser o que era: o nome da fábrica, sem número inventado.
  if (scored.length === 0) {
    return (
      <Title variant="body-sm" color="muted" className="mt-[2px]">
        {factoryLabel(stop.clientFactoryLink?.factory ?? null)}
      </Title>
    );
  }

  return (
    <div className="mt-[2px] flex flex-col gap-[3px]">
      {scored.map(({ key, factoryLabel: name, explanation }) => (
        <div key={key} className="flex items-center justify-between gap-6">
          <Title variant="body-sm" color="muted" className="min-w-0 truncate">
            {name}
          </Title>
          <Badge.Root
            color={explanation.level.tone}
            appearance="tinted"
            title={`Score ${explanation.total.toFixed(0)} de 100 — ${explanation.level.summary}`}
          >
            <Badge.Dot />
            <Badge.Text>
              {explanation.level.label} · {explanation.total.toFixed(0)}
            </Badge.Text>
          </Badge.Root>
        </div>
      ))}
    </div>
  );
}
