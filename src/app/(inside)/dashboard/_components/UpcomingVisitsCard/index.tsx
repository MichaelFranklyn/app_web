"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useNavigation } from "@/hooks/useNavigation";
import { plural } from "@/utils/format/plural";
import { ArrowRight, CalendarCheck, ListChecks } from "lucide-react";
import { ScheduleItem } from "../../interface";
import { namedEntityLabel } from "../../utils";

interface Props {
  items: ScheduleItem[];
  /** Visitas programadas no período (feitas + pendentes). Zero quer dizer que a
   * semana nem foi montada — e não que tudo já foi visitado. */
  totalPlannedVisits: number;
  /** Vendedor escolhido pelo gestor (nulo quando é o próprio vendedor): o
   * "Montar semana" abre a semana DELE. */
  sellerId: string | null;
}

/** "Montar semana" leva o vendedor escolhido; sem ele, a página abre a própria
 * semana de quem está logado. A semana fica no padrão de lá (a próxima). */
const planWeekHref = (sellerId: string | null) =>
  sellerId
    ? `/schedule/plan?${new URLSearchParams({ sellerId }).toString()}`
    : "/schedule/plan";

export function UpcomingVisitsCard({
  items,
  totalPlannedVisits,
  sellerId,
}: Props) {
  const { navigateTo, isPending } = useNavigation();
  const notPlanned = totalPlannedVisits === 0;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Próximas visitas</Card.Header.Title>
        {/* A contagem fica sob o título, e não numa etiqueta ao lado do botão:
            no celular etiqueta + botão não cabiam ao lado do título e o
            cabeçalho descia os dois em faixas de largura total (relato de
            20/11/2026). */}
        {/* Sem semana montada, "0 planejadas" só repetiria o vazio abaixo. */}
        {!notPlanned && (
          <Card.Header.Description>
            {plural(items.length, "planejada", "planejadas")}
          </Card.Header.Description>
        )}
        <Card.Header.Actions>
          <Button.Root
            type="button"
            color="amber"
            appearance="solid"
            size="sm"
            disabled={isPending}
            onClick={() => navigateTo("/schedule")}
          >
            <Button.Title>Ver rotina</Button.Title>
            <Button.Icon icon={ArrowRight} />
          </Button.Root>
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body padding="compact">
        {items.length === 0 ? (
          <EmptyState.Root flat>
            <EmptyState.Icon>
              <CalendarCheck />
            </EmptyState.Icon>
            {/* Os dois vazios eram um só ("concluídas OU sem rotina"), e quem
                abria o painel de uma empresa nova não sabia o que fazer. Sem
                nada programado, o próximo passo é montar a semana — é o único
                botão de ação do painel vazio (crítica de 20/11/2026). */}
            {notPlanned ? (
              <>
                <EmptyState.Title>
                  {sellerId
                    ? "A semana deste vendedor ainda não foi montada"
                    : "Você ainda não montou a semana"}
                </EmptyState.Title>
                <EmptyState.Description>
                  Escolha os clientes e o sistema organiza o caminho das
                  visitas.
                </EmptyState.Description>
                <EmptyState.Actions>
                  <Button.Link
                    href={planWeekHref(sellerId)}
                    appearance="solid"
                    color="amber"
                    size="sm"
                  >
                    <Button.Icon icon={ListChecks} />
                    <Button.Title>Montar semana</Button.Title>
                  </Button.Link>
                </EmptyState.Actions>
              </>
            ) : (
              <>
                <EmptyState.Title>Nenhuma visita pendente</EmptyState.Title>
                <EmptyState.Description>
                  As visitas programadas do período já foram registradas.
                </EmptyState.Description>
              </>
            )}
          </EmptyState.Root>
        ) : (
          items.map((item) => (
            // Cliente em destaque e fábrica embaixo, como nome + detalhe: lado a
            // lado (rótulo apagado × fábrica em negrito) a hierarquia ficava
            // invertida e, no celular, o nome quebrava em várias linhas
            // (relato de 20/11/2026). Cada um trunca na própria linha.
            <Card.Item key={item.id}>
              <Card.Item.Info>
                <Card.Item.Info.Name>
                  {namedEntityLabel(item.clientFactoryLink?.client ?? null)}
                </Card.Item.Info.Name>
                <Card.Item.Info.Sub>
                  {namedEntityLabel(item.clientFactoryLink?.factory ?? null)}
                </Card.Item.Info.Sub>
              </Card.Item.Info>
              <Badge.Root color="blue" appearance="tinted" className="shrink-0">
                <Badge.Text>#{item.plannedOrder}</Badge.Text>
              </Badge.Root>
            </Card.Item>
          ))
        )}
      </Card.Body>
    </Card.Root>
  );
}
