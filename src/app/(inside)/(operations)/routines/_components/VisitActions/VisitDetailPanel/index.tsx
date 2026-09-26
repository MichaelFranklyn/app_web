"use client";
import { Alert } from "@/components/Alert";
import { Drawer } from "@/components/Drawer";

import { Badge } from "@/components/Badges";
import { factoryName } from "@/utils/company";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import {
  CalendarClock,
  PackageSearch,
  Pencil,
  ReceiptText,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { VisitScheduleItem } from "../../../interface";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  getVisitFollowupWarning,
  getVisitScoreReasons,
} from "../../../utils";
import { ALL_OUTCOME_LABEL, contactLabel, contactNoun } from "@/utils/visit";
import { ContactLinks } from "../../ContactLinks";
import { VisitScoreReasons } from "./VisitScoreReasons";

interface Props {
  item: VisitScheduleItem;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStock: () => void;
  onReschedule: () => void;
  onOrder?: () => void;
  /** Abre a ficha do cliente (ausente quando a visita não tem cliente). */
  onClient?: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      <Title variant="body-sm">{value}</Title>
    </div>
  );
}

export function VisitDetailPanel({
  item,
  open,
  onClose,
  onEdit,
  onStock,
  onReschedule,
  onOrder,
  onClient,
}: Props) {
  const warning = getVisitFollowupWarning(item);
  const client = item.clientFactoryLink?.client ?? null;
  const factory = item.clientFactoryLink?.factory ?? null;
  const clientName = clientDisplayName(client);
  const factoryLabel = factoryName(factory);
  const isRemote = item.contactType === "REMOTE";
  const noun = contactNoun(item.contactType);
  const typeLabel = contactLabel(item.contactType);

  const outcomeLabel = item.outcome
    ? (ALL_OUTCOME_LABEL[item.outcome] ?? item.outcome)
    : null;
  // As fábricas tratadas saem das observações de estoque registradas: é o que o
  // vendedor de fato levantou nesta ida, e não só a fábrica que motivou a visita.
  const treatedLabel =
    (item.treatedFactories ?? []).map((f) => factoryName(f)).join(", ") || null;
  // O motivo do score responde "por que vou até este cliente": vem por empresa,
  // já que quem pontua é o vínculo com cada fábrica.
  const scoreReasons = getVisitScoreReasons(item);

  return (
    <Drawer.Root
      open={open}
      onClose={onClose}
      label={`Detalhes d${isRemote ? "o" : "a"} ${noun}`}
      width={400}
    >
      <Drawer.Header>
        <Title variant="micro" color="muted">
          Parada #{item.plannedOrder} · {typeLabel}
        </Title>
        <Title variant="heading-sm" className="mt-2 truncate">
          {clientName}
        </Title>
        <Title variant="body-xs" color="muted" className="mt-2 truncate">
          {factoryLabel}
        </Title>
        {/* Atalho para a ficha: é o caminho mais pedido a partir da visita
                (histórico de pedidos, estoque, contatos do cliente). */}
        {onClient && (
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            noUppercase
            className="mt-8"
            onClick={onClient}
          >
            <Button.Icon icon={UserRound} />
            <Button.Title>Ver cliente</Button.Title>
          </Button.Root>
        )}
      </Drawer.Header>

      <Drawer.Body>
        {warning && (
          <Alert.Root variant="warning">
            <Alert.Icon icon={TriangleAlert} />
            <Alert.Content>
              <Alert.Description>{warning.message}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <div>
          <Title variant="micro" color="muted">
            Situação
          </Title>
          <div className="mt-4">
            <Badge.Root
              color={VISIT_STATUS_COLOR[item.status]}
              appearance="tinted"
            >
              <Badge.Text>{VISIT_STATUS_LABEL[item.status]}</Badge.Text>
            </Badge.Root>
          </div>
        </div>

        {/* O porquê vem antes dos detalhes de execução (horário, duração,
              deslocamento): é a informação que faz o vendedor entender a
              sugestão do sistema em vez de só cumpri-la. */}
        <VisitScoreReasons reasons={scoreReasons} />

        {/* Como falar com o cliente — só faz sentido no contato remoto; na
              visita o que importa é o endereço, que já está no mapa do dia. */}
        {isRemote && (
          <div className="flex flex-col gap-6">
            <Title variant="micro" color="muted">
              Como falar
            </Title>
            <ContactLinks
              contact={client?.primaryContact ?? null}
              clientName={clientName}
              clientId={client?.id ?? null}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-16">
          <Field label="Ordem na rota" value={`#${item.plannedOrder}`} />
          {!isRemote && (
            <Field
              label="Horário previsto"
              value={
                item.plannedStartTime
                  ? `${item.plannedStartTime} – ${item.plannedEndTime ?? ""}`
                  : "—"
              }
            />
          )}
          {!isRemote && (
            <Field
              label="Duração da visita"
              value={
                item.visitDurationMin != null
                  ? `${item.visitDurationMin} min`
                  : "—"
              }
            />
          )}
          {!isRemote && (
            <Field
              label="Deslocamento até aqui"
              value={
                item.estimatedTravelMin != null
                  ? `${item.estimatedTravelMin} min`
                  : "—"
              }
            />
          )}
          <Field label="Resultado" value={outcomeLabel ?? "—"} />
          <Field label="Fábricas tratadas" value={treatedLabel ?? "—"} />
        </div>

        <div className="flex flex-col gap-2">
          <Title variant="micro" color="muted">
            Observações
          </Title>
          <Title variant="body-sm" color={item.notes ? "default" : "muted"}>
            {item.notes || "Sem observações registradas."}
          </Title>
        </div>
      </Drawer.Body>

      <Drawer.Footer>
        <Title variant="micro" color="muted">
          Alterar {noun}
        </Title>
        <div className="flex flex-col gap-8">
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            noUppercase
            fullWidth
            onClick={onEdit}
          >
            <Button.Icon icon={Pencil} />
            <Button.Title>Editar {noun}</Button.Title>
          </Button.Root>
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            noUppercase
            fullWidth
            onClick={onStock}
          >
            <Button.Icon icon={PackageSearch} />
            <Button.Title>Estoque do cliente</Button.Title>
          </Button.Root>
          {onOrder && (
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              noUppercase
              fullWidth
              onClick={onOrder}
            >
              <Button.Icon icon={ReceiptText} />
              <Button.Title>Novo pedido</Button.Title>
            </Button.Root>
          )}
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            noUppercase
            fullWidth
            onClick={onReschedule}
          >
            <Button.Icon icon={CalendarClock} />
            <Button.Title>Remarcar {noun}</Button.Title>
          </Button.Root>
        </div>
      </Drawer.Footer>
    </Drawer.Root>
  );
}
