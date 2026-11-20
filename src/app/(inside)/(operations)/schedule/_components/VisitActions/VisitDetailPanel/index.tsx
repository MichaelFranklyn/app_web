"use client";
import { Alert } from "@/components/Alert";
import { Drawer } from "@/components/Drawer";

import { Badge } from "@/components/Badges";
import { factoryName } from "@/utils/company";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import { formatDate } from "@/utils/format/date";
import {
  CalendarCheck,
  CalendarClock,
  Check,
  Handshake,
  MapPin,
  PackageSearch,
  Pencil,
  ReceiptText,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { VisitScheduleItem } from "../../../interface";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  getVisitFollowupWarning,
  getVisitScoreReasons,
  otherOfficeOffers,
} from "../../../utils";
import { ALL_OUTCOME_LABEL, contactLabel, contactNoun } from "@/utils/visit";
import { ContactLinks } from "../../ContactLinks";
import { VisitPlaybook } from "./VisitPlaybook";
import { VisitOtherOffers } from "./VisitOtherOffers";
import { VisitScoreReasons } from "./VisitScoreReasons";
import { itemClient } from "../../../calendar";

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
  /**
   * "Visitei / Não deu": só na parada ainda aberta, de hoje ou de antes, e
   * com a resposta já no servidor. Ausente, a linha some.
   */
  answer?: { onDone: () => void; onMissed: () => void; isBusy: boolean };
  /** Ligação que vira visita presencial (só o contato remoto pendente). */
  onPromote?: () => void;
  /** A visita presencial tomou o dia (só pendente ou concluída). */
  onWholeDay?: () => void;
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
  answer,
  onPromote,
  onWholeDay,
}: Props) {
  const warning = getVisitFollowupWarning(item);
  const client = itemClient(item);
  const factory = item.clientFactoryLink?.factory ?? null;
  const clientName = clientDisplayName(client);
  const factoryLabel = factoryName(factory);
  const isRemote = item.contactType === "REMOTE";
  const noun = contactNoun(item.contactType);
  const typeLabel = contactLabel(item.contactType);
  // A ligação do escritório não tem vínculo: roteiro, score e estoque são da
  // carteira de quem vende, e ali não há o que mostrar.
  const hasLink = Boolean(item.clientFactoryLink);

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
  // O cliente compra outras fábricas suas por outro escritório: na mesma ida,
  // dá para oferecer todas. Nome e score — nada de comissão ou preço de lá.
  const otherOffers = otherOfficeOffers(item.otherOfficeFactories);

  return (
    <Drawer.Root
      open={open}
      onClose={onClose}
      label={`Detalhes da ${noun}`}
      width={400}
    >
      <Drawer.Header>
        <Title variant="micro" color="muted">
          Parada #{item.plannedOrder} · {typeLabel}
        </Title>
        {/* Quebra em vez de cortar: no celular o painel tem ~360px e a razão
            social inteira é o que o vendedor confere antes de entrar
            (relato de 20/11/2026 — "o nome do cliente está cortando"). */}
        <Title variant="heading-sm" className="mt-2 block break-words">
          {clientName}
        </Title>
        <Title
          variant="body-xs"
          color="muted"
          className="mt-2 block break-words"
        >
          {factoryLabel}
        </Title>
        {/* Atalho para a ficha: é o caminho mais pedido a partir da visita
                (histórico de pedidos, estoque, contatos do cliente). */}
        {onClient && (
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
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

        {/* O combinado vem antes de tudo: é o motivo desta parada, dito por
              quem a marcou — e o pedido de que ela trata, a um toque. */}
        {(item.reason || item.order) && (
          <div className="flex flex-col gap-6">
            <Title variant="micro" color="muted">
              Combinado com o cliente
            </Title>
            {item.reason && <Title variant="body-sm">{item.reason}</Title>}
            {item.order && (
              <Button.Link
                href={`/orders/${item.order.id}`}
                appearance="tinted"
                size="sm"
                fullWidth
              >
                <Button.Icon icon={Handshake} />
                <Button.Title>
                  Abrir o pedido{" "}
                  {item.order.invoiceNumber
                    ? `NF ${item.order.invoiceNumber}`
                    : `de ${formatDate(item.order.orderDate)}`}
                </Button.Title>
              </Button.Link>
            )}
          </div>
        )}

        {/* O porquê vem antes dos detalhes de execução (horário, duração,
              deslocamento): é a informação que faz o vendedor entender a
              sugestão do sistema em vez de só cumpri-la. */}
        {hasLink && <VisitScoreReasons reasons={scoreReasons} />}

        <VisitOtherOffers offers={otherOffers} />

        {/* Depois do porquê, o que falar: é a ordem em que o vendedor pensa
              a visita no carro, antes de entrar na loja. */}
        {hasLink && <VisitPlaybook itemId={item.id} open={open} />}

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

      {/* As ações que o vendedor faz na rua ficam aqui, presas embaixo: no
          celular tocar o card abre este painel, e o menu "⋯" do card é um alvo
          pequeno — sem elas o painel só deixava LER a visita (relato de
          20/11/2026). Responder vem primeiro, em destaque, como no card de
          hoje. O resto em duas colunas, para o rodapé não engolir o corpo
          numa tela baixa; os rótulos são curtos porque o botão não quebra. */}
      <Drawer.Footer>
        {answer && (
          <div className="grid grid-cols-2 gap-8">
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              fullWidth
              loading={answer.isBusy}
              onClick={answer.onDone}
            >
              <Button.Icon icon={Check} />
              <Button.Title>{isRemote ? "Liguei" : "Visitei"}</Button.Title>
            </Button.Root>
            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              size="md"
              fullWidth
              disabled={answer.isBusy}
              onClick={answer.onMissed}
            >
              <Button.Icon icon={X} />
              <Button.Title>Não deu</Button.Title>
            </Button.Root>
          </div>
        )}
        <Title variant="micro" color="muted" className={answer ? "mt-8" : ""}>
          Mais ações
        </Title>
        <div className="grid grid-cols-2 gap-8 [&>:last-child:nth-child(odd)]:col-span-2">
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            fullWidth
            onClick={onEdit}
          >
            <Button.Icon icon={Pencil} />
            <Button.Title>Editar</Button.Title>
          </Button.Root>
          {hasLink && (
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              fullWidth
              onClick={onStock}
            >
              <Button.Icon icon={PackageSearch} />
              <Button.Title>Estoque</Button.Title>
            </Button.Root>
          )}
          {onOrder && (
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
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
            fullWidth
            onClick={onReschedule}
          >
            <Button.Icon icon={CalendarClock} />
            <Button.Title>Remarcar</Button.Title>
          </Button.Root>
          {onPromote && (
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              fullWidth
              onClick={onPromote}
            >
              <Button.Icon icon={MapPin} />
              <Button.Title>Ir visitar</Button.Title>
            </Button.Root>
          )}
          {onWholeDay && (
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              fullWidth
              className="col-span-2"
              onClick={onWholeDay}
            >
              <Button.Icon icon={CalendarCheck} />
              <Button.Title>Tomou o dia todo</Button.Title>
            </Button.Root>
          )}
        </div>
      </Drawer.Footer>
    </Drawer.Root>
  );
}
