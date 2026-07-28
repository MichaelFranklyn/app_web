"use client";

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
  X,
} from "lucide-react";
import { VisitScheduleItem } from "../../../interface";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  getVisitFollowupWarning,
} from "../../../utils";
import { ALL_OUTCOME_LABEL, contactLabel, contactNoun } from "@/utils/visit";
import { ContactLinks } from "../../ContactLinks";

interface Props {
  item: VisitScheduleItem;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStock: () => void;
  onReschedule: () => void;
  onOrder?: () => void;
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

  return (
    <>
      {/* Backdrop — clicar fora fecha. Acima do conteúdo, abaixo dos modais (z-50). */}
      <div
        className={`fixed inset-0 z-[55] bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        data-testid="visit-panel-backdrop"
        aria-hidden
      />

      <aside
        role="dialog"
        aria-label={`Detalhes d${isRemote ? "o" : "a"} ${noun}`}
        className={`fixed top-0 right-0 z-[60] flex h-full w-[400px] max-w-[calc(100vw-32px)] flex-col border-l border-(--border) bg-(--bg) shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-8 border-b border-(--border) px-20 py-16">
          <div className="min-w-0">
            <Title variant="micro" color="muted">
              Parada #{item.plannedOrder} · {typeLabel}
            </Title>
            <Title variant="heading-sm" className="mt-2 truncate">
              {clientName}
            </Title>
            <Title variant="body-xs" color="muted" className="mt-2 truncate">
              {factoryLabel}
            </Title>
          </div>
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            isIconOnly
            onClick={onClose}
            aria-label="Fechar"
          >
            <Button.Icon icon={X} />
          </Button.Root>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-1 flex-col gap-16 overflow-y-auto px-20 py-16">
          {warning && (
            <div className="flex items-start gap-8 rounded-(--r-md) border border-(--amber) bg-(--amber-bg) px-12 py-10">
              <TriangleAlert
                size={16}
                className="mt-[1px] shrink-0 text-(--amber)"
              />
              <Title variant="body-xs" className="text-(--amber)">
                {warning.message}
              </Title>
            </div>
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
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-16">
            <Field label="Ordem na rota" value={`#${item.plannedOrder}`} />
            {!isRemote && (
              <Field
                label="Tempo estimado"
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
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-8 border-t border-(--border) px-20 py-16">
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
                <Button.Title>Lançar pedido</Button.Title>
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
        </div>
      </aside>
    </>
  );
}
