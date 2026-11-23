"use client";
import { Card } from "@/components/Card";

import { Badge } from "@/components/Badges";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { IconTile } from "@/components/IconTile";
import { TextButton } from "@/components/TextLink";
import { Button } from "@/components/Button";
import { Check, CloudUpload, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import { clientDisplayName } from "@/utils/client";
import { visitPriority } from "@/utils/score";
import { VisitScheduleItem } from "../../interface";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  AWAITING_SIGNAL_HINT,
  formatTravelToStop,
  formatVisitSlot,
  getVisitFollowupWarning,
  getVisitScoreTotal,
  visitScoreChips,
} from "../../utils";
import { PushAnswer, useVisitActions } from "../../useVisitActions";
import { factoryName } from "@/utils/company";
import { contactNoun } from "@/utils/visit";
import { ContactLinks } from "../ContactLinks";
import { ViabilityNote } from "../ViabilityNote";
import { FactoryScoreHint } from "../FactoryScoreHint";
import { chipAppearance } from "../../appearance";
import { NegativeTag } from "@/components/ClientFactoryNegative";
import { itemClient } from "../../calendar";
import { canDragItem, writeDrag } from "../../dragItem";

interface Props {
  item: VisitScheduleItem;
  dayDate?: string | null;
  /**
   * `compact` é o da semana em sete colunas: o mesmo cartão (concluir, tipo,
   * menu, fábricas, urgência), sem os divisores e as faixas de largura total
   * que o deixavam alto. O WhatsApp fica no painel — numa coluna de 140px os
   * botões não cabem. É o cartão que se arrasta para outro dia.
   */
  density?: "full" | "compact";
  /**
   * O outro escritório da pessoa que também tem visita a este cliente neste
   * dia — é uma ida só, e concluir aqui conclui lá.
   */
  alsoInOffice?: string | null;
  /**
   * Os botões grandes "Visitei" / "Não deu" no próprio cartão — a rota de hoje
   * do vendedor, respondida em um toque sem abrir nada (TASK-006).
   */
  quickAnswer?: boolean;
  /**
   * Na rota do dia o cartão abre com o número da parada no lugar da caixinha:
   * é uma lista em ordem de trajeto. A caixinha volta onde não há "Visitei".
   */
  stopNumber?: number | null;
  /** Resposta que veio do botão do aviso no celular para ESTA visita. */
  autoAnswer?: PushAnswer | null;
  onChanged: () => void;
}

const getFactoryName = (item: VisitScheduleItem): string => {
  const factory = item.clientFactoryLink?.factory;
  if (!factory) return "—";
  return factoryName(factory);
};

// Quantos nomes de fábrica cabem sem espremer o card; o resto vira "+N".
// Mesmo molde do card de Montar semana (PriorityClientRow): o que vem abaixo
// do nome se alinha com ele no desktop (caixinha 24px + gap 8px) e volta para a
// borda no celular, onde a largura é curta demais para perder 32px.
const UNDER_NAME = "desktop:pl-[32px]";

// Etiquetas do tamanho do próprio texto, quebrando a linha quando faltar
// espaço: esticadas na largura do card (celular) pareciam botões.
const TAGS_ROW = "flex flex-wrap items-center gap-x-8 gap-y-4 empty:hidden";

/** A linha do lugar: bairro, cidade - UF. */
const placeLine = (client: ReturnType<typeof itemClient>): string =>
  client
    ? [
        client.addressNeighborhood,
        [client.addressCity, client.addressState].filter(Boolean).join(" - "),
      ]
        .filter(Boolean)
        .join(", ")
    : "";

const FACTORY_NAMES_SHOWN = 2;

/**
 * O cabeçalho do tooltip de score. A visita pode servir a mais de um
 * escritório; quem diz quais é o próprio painel (uma fábrica por linha, com o
 * escritório dela). Só a ida marcada também no outro escritório no mesmo dia
 * precisa de aviso: concluir aqui conclui lá.
 */
const scoreHintTitle = (alsoInOffice: string | null): string =>
  alsoInOffice
    ? `Também marcada no ${alsoInOffice} neste dia: é uma ida só, e concluir aqui conclui lá.`
    : "Score por fábrica";

/**
 * As fábricas que esta visita vai tratar. Uma visita cobre o cliente inteiro:
 * se duas fábricas dele estão urgentes, o vendedor conversa sobre as duas na
 * mesma ida — por isso o card lista os nomes em vez de uma fábrica só.
 */
const getFocusLabel = (item: VisitScheduleItem): string => {
  const names = (item.focusFactories ?? [])
    .map((focus) => factoryName(focus.factory))
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) return getFactoryName(item);

  const shown = names.slice(0, FACTORY_NAMES_SHOWN).join(", ");
  const rest = names.length - FACTORY_NAMES_SHOWN;
  return rest > 0 ? `${shown} +${rest}` : shown;
};

// Card de uma visita na grade semanal. O card inteiro é clicável e abre o
// painel lateral de detalhes; o checkbox é um atalho para concluir/reabrir a
// visita e o menu de três pontos cobre as demais ações. Os controles têm o
// clique isolado (stopPropagation) para não dispararem o painel.
export function VisitCard({
  item,
  dayDate,
  density = "full",
  alsoInOffice = null,
  quickAnswer = false,
  autoAnswer = null,
  stopNumber = null,
  onChanged,
}: Props) {
  const {
    status,
    isAwaitingSignal,
    openView,
    toggleCompleted,
    openMissed,
    isToggling,
    menu,
    overlays,
  } = useVisitActions({ item, dayDate, onChanged, autoAnswer });

  const isCompleted = status === "COMPLETED";
  const isRemote = item.contactType === "REMOTE";
  const noun = contactNoun(item.contactType);
  const client = itemClient(item);
  const clientName = clientDisplayName(client);
  const warning = getVisitFollowupWarning(item);
  const scoreValue = getVisitScoreTotal(item);
  const priority = scoreValue != null ? visitPriority(scoreValue) : null;

  // "Pendente" é o estado esperado de toda visita futura — mostrar o badge em
  // cada card só polui a coluna. Ele aparece quando a visita saiu do previsto
  // (realizada, ausente, remarcada…), que é a informação que vale destacar.
  const showStatusBadge = status !== "PENDING" || isAwaitingSignal;
  const { name: currentOffice } = useCompanyBranding();
  const hintTitle = scoreHintTitle(alsoInOffice);
  // O tooltip de Montar semana: score e motivo de cada fábrica, por escritório.
  const scoreChips = visitScoreChips(item, currentOffice ?? null);
  // Só a faixa "Urgente" ganha selo: as outras (atenção, acompanhar,
  // tranquilo) eram ruído em todo cartão. O número fica no tooltip. Score não
  // se aplica a visita concluída: o que importa passa a ser o estado.
  const showPriority = priority?.tone === "red" && !isCompleted;
  const place = placeLine(client);
  const isCompact = density === "compact";
  const look = chipAppearance(item);
  const isDraggable =
    isCompact && Boolean(dayDate) && canDragItem(item, isAwaitingSignal);
  // O motivo de quem marcou vem no lugar das fábricas: é ele que explica a parada.
  const subtitle = item.reason ?? getFocusLabel(item);
  // Só a parada ainda aberta e já com a resposta no servidor: a que está
  // guardada no aparelho mostra o "aguardando sinal" no lugar.
  const showQuickAnswer =
    quickAnswer && !isCompact && status === "PENDING" && !isAwaitingSignal;
  // Com "Visitei" / "Não deu" no cartão, a caixinha seria um terceiro jeito de
  // responder a mesma coisa: no lugar dela vai o número da parada.
  const showNumber = !isCompact && stopNumber != null && quickAnswer;

  return (
    <>
      {overlays}
      <Card.Root
        inset
        tone="muted"
        interactive
        // A borda esquerda na cor do tipo (visita × contato), nas duas
        // densidades.
        event={look.tone}
        faded={isCompleted || look.isMuted}
        // Um grupo com o nome do cliente: o cartão em si não é mais botão (o
        // botão é o nome), mas quem navega por leitor de tela ainda pula de
        // cartão em cartão — e os testes acham o cartão pelo cliente.
        role="group"
        aria-label={clientName}
        className={cn(
          "group/card",
          isDraggable && "cursor-grab active:cursor-grabbing"
        )}
        draggable={isDraggable}
        onDragStart={
          isDraggable && dayDate
            ? (e) => writeDrag(e, { itemId: item.id, fromDate: dayDate })
            : undefined
        }
        // O cartão inteiro abre o painel com o mouse ou o dedo; para o
        // teclado e o leitor de tela quem abre é o nome (um botão de verdade)
        // — um role="button" em volta da caixinha e do menu aninhava controles.
        onClick={openView}
        title={`Visualizar ${noun}`}
      >
        <Card.Body padding="sm">
          {/* Como o card de Montar semana: a caixinha e o nome na primeira
            linha, com o menu fechando à direita; o resto vem embaixo. No
            desktop o de baixo se alinha com o nome; no celular volta para a
            borda e cada etiqueta toma a linha, lida de cima a baixo como uma
            ficha (relato de 20/11/2026: "Também no <escritório>" estourava o
            card e a urgência ficava fora do alinhamento do resto). */}
          <div className="flex items-start gap-8">
            {showNumber ? (
              <IconTile size="xs" aria-label={`Parada ${stopNumber}`}>
                {stopNumber}
              </IconTile>
            ) : (
              <div
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <InputCheckbox
                  tone="green"
                  checked={isCompleted}
                  disabled={isToggling}
                  onChange={(e) => toggleCompleted(e.target.checked)}
                  title={
                    isCompleted
                      ? `Reabrir ${noun}`
                      : `Marcar ${noun} como concluída`
                  }
                  aria-label={
                    isCompleted
                      ? `Reabrir ${noun}`
                      : `Marcar ${noun} como concluída`
                  }
                />
              </div>
            )}
            {/* Nome quebra em várias linhas em vez de truncar: numa coluna de
              240px o "…" escondia justamente o que identifica a loja.
              `break-words` cobre razão social longa sem espaços. A altura
              mínima é a da caixinha (24px), para o nome ficar no meio dela.
              O alerta de acompanhamento vem colado no nome: qualifica este
              compromisso. */}
            <div className="flex min-h-24 min-w-0 flex-1 items-center gap-6">
              <TextButton
                aria-label={`Visualizar ${noun}: ${clientName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  openView();
                }}
              >
                <Title
                  variant={isCompact ? "body-xs" : "body-sm"}
                  weight="semibold"
                  color={isCompleted || look.isMuted ? "muted" : "default"}
                  className={cn(
                    "block min-w-0 break-words",
                    isCompact && [
                      "line-clamp-2",
                      // Como o Jira: o nome longo fica em duas linhas e, com o
                      // mouse (ou o foco) no card, aparece inteiro — o card cresce
                      // para baixo e empurra os de baixo, sem sobrepor.
                      "group-focus-within/card:line-clamp-none group-hover/card:line-clamp-none",
                    ],
                    isCompleted && "line-through"
                  )}
                >
                  {clientName}
                </Title>
              </TextButton>
              {warning && (
                <TriangleAlert
                  size={14}
                  className="shrink-0 text-(--color-action-text)"
                  aria-label={warning.message}
                >
                  <title>{warning.message}</title>
                </TriangleAlert>
              )}
            </div>
            <div
              className="-mr-4 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {menu}
            </div>
          </div>

          <div className={`mt-4 flex flex-col gap-6 ${UNDER_NAME}`}>
            <Title
              variant={isCompact ? "micro" : "body-xs"}
              color="muted"
              className={cn(
                "block truncate",
                isCompact &&
                  "group-focus-within/card:break-words group-focus-within/card:whitespace-normal group-hover/card:break-words group-hover/card:whitespace-normal"
              )}
              title={subtitle}
            >
              {subtitle}
            </Title>
            {/* Sem endereço, a linha diz isso em vez de sumir: é a pista de
              que o cadastro precisa ser completado antes de sair. */}
            {!isCompact && (
              <Title
                variant="body-xs"
                color="muted"
                className="block truncate"
                title={place || "Sem endereço"}
              >
                {place || "Sem endereço"}
              </Title>
            )}
            {/* O tipo, de onde vem e QUANDO acontece. O horário vem antes do
              deslocamento de propósito: o número solto de minutos era lido
              como "visita de 7 minutos", o contrário do que ele significa. */}
            <div className={TAGS_ROW}>
              {/* A borda já separa visita de ligação; o selo fica só na
                ligação, que é a exceção. */}
              {isRemote && <Badge.ContactType contactType={item.contactType} />}
              {!isCompact && (
                <>
                  <Badge.FixedVisit fixedScheduleId={item.fixedScheduleId} />
                  <Badge.Trip tripId={item.tripId} />
                  {/* A parada continua de pé — negativar não desmarca o que
                    já estava agendado —, mas quem vai precisa saber que esta
                    fábrica não fecha pedido. */}
                  <NegativeTag
                    isNegative={Boolean(item.clientFactoryLink?.isNegative)}
                    negativeSince={null}
                    negativeReason={
                      item.clientFactoryLink?.negativeReason ?? null
                    }
                    activeLabel={null}
                  />
                </>
              )}
              {/* A urgência OU a situação entra junto das etiquetas, nas duas
                densidades — a faixa à parte, com divisor, dobrava a altura do
                cartão da rota do dia (pedido de 23/11/2026: o cartão do dia
                parecido com o da semana). */}
              {showStatusBadge ? (
                <Badge.Root
                  color={VISIT_STATUS_COLOR[status]}
                  appearance="tinted"
                  title={isAwaitingSignal ? AWAITING_SIGNAL_HINT : undefined}
                >
                  {isAwaitingSignal && !isCompact && (
                    <Badge.Icon>
                      <CloudUpload />
                    </Badge.Icon>
                  )}
                  <Badge.Text>
                    {VISIT_STATUS_LABEL[status]}
                    {isAwaitingSignal
                      ? isCompact
                        ? " · sem sinal"
                        : " · aguardando sinal"
                      : ""}
                  </Badge.Text>
                </Badge.Root>
              ) : (
                showPriority &&
                priority && (
                  <FactoryScoreHint chips={scoreChips} title={hintTitle}>
                    <Badge.Root
                      color={priority.tone}
                      appearance="tinted"
                      title={
                        scoreChips.length
                          ? undefined
                          : `${priority.label} · score ${scoreValue?.toFixed(0)}`
                      }
                      className={cn(scoreChips.length > 0 && "cursor-help")}
                    >
                      <Badge.Dot />
                      <Badge.Text>{priority.label}</Badge.Text>
                    </Badge.Root>
                  </FactoryScoreHint>
                )
              )}
            </div>
            {/* O número da parada já está no círculo: aqui ficam horário e
              deslocamento — este com nome, porque é o tempo ATÉ a parada, não
              a duração dela. Vazia, a linha some. */}
            {!isCompact && (
              <Title
                variant="micro"
                color="muted"
                className="block empty:hidden"
              >
                {[
                  showNumber ? null : `#${item.plannedOrder}`,
                  formatVisitSlot(item).replace(/^ · /, "") || null,
                  formatTravelToStop(item.estimatedTravelMin) || null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Title>
            )}
            {/* "Dá pedido nesse cliente hoje?" — a pergunta que o vendedor só
              conseguia fazer no balcão, tarde. */}
            {!isCompact && <ViabilityNote viability={item.viability} />}
          </div>

          {/* Ligar/WhatsApp direto do card: o contato remoto só é executável se o
            vendedor tiver o número à mão. Some quando já foi concluído. */}
          {isRemote && !isCompleted && !isCompact && (
            <div
              className="mt-8"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <ContactLinks
                contact={client?.primaryContact ?? null}
                clientName={clientName}
                clientId={client?.id ?? null}
              />
            </div>
          )}

          {/* Responder em um toque: o alvo grande é para quem está na rua, com
            o celular numa mão. "Visitei" já oferece pedido/estoque em seguida;
            "Não deu" pergunta o motivo numa tela só. */}
          {showQuickAnswer && (
            <div
              className="mt-8 grid grid-cols-2 gap-8"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="sm"
                fullWidth
                loading={isToggling}
                onClick={() => toggleCompleted(true)}
              >
                <Button.Icon icon={Check} />
                <Button.Title>{isRemote ? "Liguei" : "Visitei"}</Button.Title>
              </Button.Root>
              <Button.Root
                type="button"
                appearance="outline"
                color="neutral"
                size="sm"
                fullWidth
                disabled={isToggling}
                onClick={openMissed}
              >
                <Button.Icon icon={X} />
                <Button.Title>Não deu</Button.Title>
              </Button.Root>
            </div>
          )}
        </Card.Body>
      </Card.Root>
    </>
  );
}
