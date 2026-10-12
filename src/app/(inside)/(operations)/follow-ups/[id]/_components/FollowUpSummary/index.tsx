"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import { formatDate } from "@/utils/format/date";
import {
  FollowUpDetail,
  isFollowUpOpen,
  responsibleName,
} from "@/utils/followUp";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  followUp: FollowUpDetail;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Title variant="label" color="muted">
        {label}
      </Title>
      {children}
    </div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-(--amber) hover:underline">
      <Title variant="body-sm" weight="medium" className="text-inherit">
        {children}
      </Title>
    </Link>
  );
}

/** A ficha do contato: com quem, quando, quem faz e sobre o quê. */
export function FollowUpSummary({ followUp }: Props) {
  const client = clientDisplayName(followUp.client);
  const open = isFollowUpOpen(followUp.status);

  return (
    <Card.Root>
      <div className="tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-2 gap-16">
        <Field label="Cliente">
          {/* A rota do cliente é pelo id da CARTEIRA, não pelo do cliente. */}
          {followUp.companyClientId ? (
            <TextLink href={`/clients/${followUp.companyClientId}/overview`}>
              {client}
            </TextLink>
          ) : (
            <Title variant="body-sm">{client}</Title>
          )}
        </Field>
        <Field label="Dia do contato">
          <Title variant="body-sm">{formatDate(followUp.dueDate)}</Title>
        </Field>
        <Field label="Quem vai fazer">
          <Title variant="body-sm">
            {responsibleName(followUp.responsible, "—")}
          </Title>
        </Field>
        <Field label="Agendado por">
          <Title variant="body-sm">
            {followUp.createdBy?.name ?? "—"} em{" "}
            {formatDate(followUp.createdAt)}
          </Title>
        </Field>
        {followUp.order && (
          <Field label="Pedido">
            <TextLink href={`/orders/${followUp.order.id}`}>
              {followUp.order.invoiceNumber
                ? `NF ${followUp.order.invoiceNumber}`
                : `Pedido de ${formatDate(followUp.order.orderDate)}`}
            </TextLink>
          </Field>
        )}
        {followUp.previousId && (
          <Field label="Continua o contato">
            <TextLink href={`/follow-ups/${followUp.previousId}`}>
              Ver o anterior
            </TextLink>
          </Field>
        )}
        {followUp.linkedReturn && (
          <Field label="Atende o retorno combinado">
            <Title variant="body-sm">
              Para {formatDate(followUp.linkedReturn.returnDate)} (combinado em{" "}
              {formatDate(followUp.linkedReturn.agreedOn)})
            </Title>
          </Field>
        )}
        {followUp.status === "DONE" && followUp.isCommercial !== null && (
          <Field label="Conversa de venda">
            <Title variant="body-sm">
              {followUp.isCommercial ? "Sim" : "Não"}
            </Title>
          </Field>
        )}
        {followUp.next && (
          <Field label="Próximo contato">
            <TextLink href={`/follow-ups/${followUp.next.id}`}>
              {formatDate(followUp.next.dueDate)}
            </TextLink>
          </Field>
        )}
      </div>

      {followUp.notes && (
        <div className="mt-16 flex flex-col gap-4">
          <Title variant="label" color="muted">
            Observações
          </Title>
          <Title variant="body-sm" className="whitespace-pre-line">
            {followUp.notes}
          </Title>
        </div>
      )}

      {!open && followUp.outcome && (
        <div className="mt-16 flex flex-col gap-4">
          <Title variant="label" color="muted">
            {followUp.status === "DONE"
              ? "O que foi conversado"
              : "Por que foi cancelado"}
          </Title>
          <Title variant="body-sm" className="whitespace-pre-line">
            {followUp.outcome}
          </Title>
        </div>
      )}
      {/* Cancelado de antes de o motivo ser obrigatório: sem o aviso, o campo
          simplesmente sumia e parecia que a ficha não tinha carregado. */}
      {followUp.status === "CANCELLED" && !followUp.outcome && (
        <div className="mt-16 flex flex-col gap-4">
          <Title variant="label" color="muted">
            Por que foi cancelado
          </Title>
          <Title variant="body-sm" color="muted">
            Motivo não registrado — este contato foi cancelado antes de a
            justificativa ser obrigatória.
          </Title>
        </div>
      )}
    </Card.Root>
  );
}
