"use client";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Drawer } from "@/components/Drawer";
import { Title } from "@/components/Title";
import { toTitleCase } from "@/utils/format/titleCase";
import {
  contactLabel,
  contactNoun,
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
} from "@/utils/visit";
import { Building2, Check, RotateCcw, X } from "lucide-react";

import { CrossOfficeStop } from "../../interface";

interface Props {
  stop: CrossOfficeStop;
  open: boolean;
  onClose: () => void;
  onToggleCompleted: (checked: boolean) => void;
  onMarkAbsent: () => void;
  isSaving: boolean;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      <Title variant="body-sm" className="break-words">
        {value}
      </Title>
    </div>
  );
}

const addressLine = (stop: CrossOfficeStop): string =>
  [
    stop.address,
    stop.neighborhood,
    [stop.city, stop.state].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(", ");

/**
 * O detalhe de uma parada da rotina no OUTRO escritório — o mesmo painel
 * lateral que a parada daqui abre no clique (relato de 23/11/2026: "não são
 * todos os cards que abrem a box lateral"). Mostra só quem, onde, de qual
 * escritório e o estado; nada de preço, comissão ou percentual da fábrica de
 * lá. Pedido e estoque continuam no escritório dono da fábrica.
 */
export function OtherOfficeStopPanel({
  stop,
  open,
  onClose,
  onToggleCompleted,
  onMarkAbsent,
  isSaving,
}: Props) {
  const noun = contactNoun(stop.contactType);
  const isRemote = stop.contactType === "REMOTE";
  const isPending = stop.status === "PENDING";
  const isCompleted = stop.status === "COMPLETED";
  const officeName = toTitleCase(stop.officeName);
  const address = addressLine(stop);

  return (
    <Drawer.Root
      open={open}
      onClose={onClose}
      label={`Detalhes da ${noun}`}
      width={400}
      unmountOnClose
    >
      <Drawer.Header>
        <Title variant="micro" color="muted">
          Parada #{stop.plannedOrder} · {contactLabel(stop.contactType)}
        </Title>
        <Title variant="heading-sm" className="mt-2 block break-words">
          {toTitleCase(stop.clientName)}
        </Title>
        {stop.factoryName && (
          <Title
            variant="body-xs"
            color="muted"
            className="mt-2 block break-words"
          >
            {stop.factoryName}
          </Title>
        )}
      </Drawer.Header>

      <Drawer.Body>
        <Alert.Root variant="info">
          <Alert.Icon icon={Building2} />
          <Alert.Content>
            <Alert.Description>
              Esta {noun} é da sua rotina no {officeName}. Pedido e estoque
              desta parada: entre no {officeName}.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        <div>
          <Title variant="micro" color="muted">
            Situação
          </Title>
          <div className="mt-4">
            <Badge.Root
              color={VISIT_STATUS_COLOR[stop.status]}
              appearance="tinted"
            >
              <Badge.Text>{VISIT_STATUS_LABEL[stop.status]}</Badge.Text>
            </Badge.Root>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16">
          <Field label="Ordem na rota" value={`#${stop.plannedOrder}`} />
          <Field label="Escritório" value={officeName} />
        </div>
        {!isRemote && (
          <Field label="Endereço" value={address || "Sem endereço"} />
        )}
      </Drawer.Body>

      {(isPending || isCompleted) && (
        <Drawer.Footer>
          {isPending ? (
            <div className="grid grid-cols-2 gap-8">
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                fullWidth
                loading={isSaving}
                onClick={() => onToggleCompleted(true)}
              >
                <Button.Icon icon={Check} />
                <Button.Title>{isRemote ? "Liguei" : "Visitei"}</Button.Title>
              </Button.Root>
              {!isRemote && (
                <Button.Root
                  type="button"
                  appearance="outline"
                  color="neutral"
                  size="md"
                  fullWidth
                  disabled={isSaving}
                  onClick={onMarkAbsent}
                >
                  <Button.Icon icon={X} />
                  <Button.Title>Não estava</Button.Title>
                </Button.Root>
              )}
            </div>
          ) : (
            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              size="md"
              fullWidth
              loading={isSaving}
              onClick={() => onToggleCompleted(false)}
            >
              <Button.Icon icon={RotateCcw} />
              <Button.Title>Reabrir {noun}</Button.Title>
            </Button.Root>
          )}
        </Drawer.Footer>
      )}
    </Drawer.Root>
  );
}
