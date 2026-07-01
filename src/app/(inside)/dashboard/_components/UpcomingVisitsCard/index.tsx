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
        <Card.Header.Actions>
          <Badge.Root appearance="tinted" color="amber">
            <Badge.Text>{items.length} planejadas</Badge.Text>
          </Badge.Root>
          <Button.Root
            type="button"
            color="amber"
            appearance="solid"
            size="sm"
            noUppercase
            disabled={isPending}
            onClick={() => navigateTo("/routines")}
          >
            <Button.Title>Ver rotina</Button.Title>
            <Button.Icon icon={ArrowRight} />
          </Button.Root>
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body padding="compact">
        {items.length === 0 ? (
          <EmptyState.Root>
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
            <Card.Item key={item.id} variant="stat">
              <Card.Item.Label>
                {namedEntityLabel(item.clientFactoryLink?.client ?? null)}
              </Card.Item.Label>
              <Card.Item.Actions>
                <Card.Item.Value>
                  {namedEntityLabel(item.clientFactoryLink?.factory ?? null)}
                </Card.Item.Value>
                <Badge.Root color="blue" appearance="tinted">
                  <Badge.Text>#{item.plannedOrder}</Badge.Text>
                </Badge.Root>
              </Card.Item.Actions>
            </Card.Item>
          ))
        )}
      </Card.Body>
    </Card.Root>
  );
}
