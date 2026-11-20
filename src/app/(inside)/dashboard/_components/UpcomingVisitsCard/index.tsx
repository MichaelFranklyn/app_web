"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useNavigation } from "@/hooks/useNavigation";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { ScheduleItem } from "../../interface";
import { namedEntityLabel } from "../../utils";

interface Props {
  items: ScheduleItem[];
}

export function UpcomingVisitsCard({ items }: Props) {
  const { navigateTo, isPending } = useNavigation();

  return (
    <Card.Root>
      <Card.Header className="min-h-13.75">
        <Card.Header.Title size="sm" weight="bold">
          Próximas visitas
        </Card.Header.Title>
        {/* A contagem fica sob o título, e não numa etiqueta ao lado do botão:
            no celular etiqueta + botão não cabiam ao lado do título e o
            cabeçalho descia os dois em faixas de largura total (relato de
            20/11/2026). */}
        <Card.Header.Description>
          {items.length === 1 ? "1 planejada" : `${items.length} planejadas`}
        </Card.Header.Description>
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
              <CalendarCheck size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Sem visitas pendentes</EmptyState.Title>
            <EmptyState.Description>
              Todas as visitas do período foram concluídas ou ainda não há
              rotina programada.
            </EmptyState.Description>
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
