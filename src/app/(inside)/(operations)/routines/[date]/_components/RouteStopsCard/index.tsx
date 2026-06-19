import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { MapPin } from "lucide-react";
import { VisitActions } from "../../../_components/VisitActions";
import { VisitItem } from "../../interface";
import {
  STOP_STATUS_COLOR,
  STOP_STATUS_LABEL,
  clientAddress,
  clientLabel,
  factoryLabel,
} from "../../utils";

interface Props {
  stops: VisitItem[];
  currentDayId: string | null;
  scheduleDays: { id: string; date: string }[];
  onChanged: () => void;
}

export function RouteStopsCard({
  stops,
  currentDayId,
  scheduleDays,
  onChanged,
}: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Sequência de paradas
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        {stops.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <MapPin size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma parada</EmptyState.Title>
            <EmptyState.Description>
              Este dia não possui visitas planejadas.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <div className="flex flex-col gap-6">
            {stops.map((stop) => {
              const client = stop.clientFactoryLink?.client ?? null;
              const factory = stop.clientFactoryLink?.factory ?? null;
              const travel = stop.estimatedTravelMin;
              return (
                <div
                  key={stop.id}
                  className="flex items-start gap-10 rounded-(--r-md) border border-(--border) p-10"
                >
                  <div className="mt-[2px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-(--amber) font-head text-[11px] font-bold text-white">
                    {stop.plannedOrder}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-(--text)">
                      {clientLabel(client)}
                    </div>
                    <div className="mt-[2px] text-[12px] text-(--muted)">
                      {factoryLabel(factory)}
                    </div>
                    <div className="mt-[2px] text-[12px] text-(--muted2)">
                      {clientAddress(client)}
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                      {travel != null && (
                        <Title variant="micro" color="muted">
                          ~{travel} min de visita
                        </Title>
                      )}
                      <Badge.Root
                        color={STOP_STATUS_COLOR[stop.status]}
                        appearance="tinted"
                      >
                        <Badge.Text>{STOP_STATUS_LABEL[stop.status]}</Badge.Text>
                      </Badge.Root>
                    </div>
                  </div>

                  <div className="-mr-[4px] shrink-0">
                    <VisitActions
                      item={stop}
                      currentDayId={currentDayId}
                      scheduleDays={scheduleDays}
                      onChanged={onChanged}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
