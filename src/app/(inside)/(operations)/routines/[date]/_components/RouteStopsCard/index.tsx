import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactLinks } from "../../../_components/ContactLinks";
import { VisitActions } from "../../../_components/VisitActions";
import { ViabilityNote } from "../../../_components/ViabilityNote";
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
  /** Data do dia da rota — usada ao transformar uma ligação em visita. */
  dayDate: string;
  onChanged: () => void;
  /**
   * "remote" muda só a moldura: os contatos do dia não são paradas de rota, mas
   * a linha (cliente, fábrica, status, ações) é exatamente a mesma.
   */
  variant?: "route" | "remote";
}

export function RouteStopsCard({
  stops,
  dayDate,
  onChanged,
  variant = "route",
}: Props) {
  const isRemote = variant === "remote";

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          {isRemote ? "Contatos do dia" : "Sequência de paradas"}
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
          // Paradas lado a lado, quebrando conforme a largura: o card agora
          // ocupa meia tela (ou a tela toda), e uma coluna única deixava um dia
          // de 8 visitas com metros de rolagem e um vazio à direita. O mínimo de
          // 260px é o que o bloco precisa para o nome da loja não truncar.
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-8">
            {stops.map((stop) => {
              const client = stop.clientFactoryLink?.client ?? null;
              const factory = stop.clientFactoryLink?.factory ?? null;
              const travel = stop.estimatedTravelMin;
              return (
                <div
                  key={stop.id}
                  className="flex items-start gap-10 rounded-(--r-md) border border-(--border) p-10"
                >
                  <div
                    className={cn(
                      "font-head mt-[2px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white",
                      isRemote ? "bg-(--blue)" : "bg-(--amber)"
                    )}
                  >
                    {isRemote ? (
                      <Phone size={12} aria-hidden />
                    ) : (
                      stop.plannedOrder
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Title variant="body-sm" weight="medium">
                      {clientLabel(client)}
                    </Title>
                    <Title variant="body-sm" color="muted" className="mt-[2px]">
                      {factoryLabel(factory)}
                    </Title>
                    {/* No contato, o endereço não serve para nada — o que o
                        vendedor precisa é do telefone. */}
                    {isRemote ? (
                      <div className="mt-6">
                        <ContactLinks
                          contact={client?.primaryContact ?? null}
                          clientName={clientLabel(client)}
                        />
                      </div>
                    ) : (
                      <Title
                        variant="body-sm"
                        color="muted2"
                        className="mt-[2px]"
                      >
                        {clientAddress(client)}
                      </Title>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-6">
                      {/* Era aqui que o deslocamento se disfarçava de duração:
                          "~7 min de visita" eram 7 minutos DE CARRO até a loja.
                          Agora o horário e a duração vêm da agenda, e o
                          deslocamento aparece com o nome dele. */}
                      {!isRemote && stop.plannedStartTime && (
                        <Title variant="micro" color="muted">
                          {stop.plannedStartTime}
                          {stop.plannedEndTime ? `–${stop.plannedEndTime}` : ""}
                          {stop.visitDurationMin
                            ? ` · ${stop.visitDurationMin} min de visita`
                            : ""}
                        </Title>
                      )}
                      {travel != null && travel > 0 && !isRemote && (
                        <Title variant="micro" color="muted2">
                          {travel} min até aqui
                        </Title>
                      )}
                      <Badge.Root
                        color={STOP_STATUS_COLOR[stop.status]}
                        appearance="tinted"
                      >
                        <Badge.Text>
                          {STOP_STATUS_LABEL[stop.status]}
                        </Badge.Text>
                      </Badge.Root>
                    </div>
                    {/* "Dá pedido nesse cliente hoje?" — a pergunta que o
                        vendedor só conseguia fazer no balcão, tarde. */}
                    <ViabilityNote viability={stop.viability} />
                  </div>

                  <div className="-mr-[4px] shrink-0">
                    <VisitActions
                      item={stop}
                      dayDate={dayDate}
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
