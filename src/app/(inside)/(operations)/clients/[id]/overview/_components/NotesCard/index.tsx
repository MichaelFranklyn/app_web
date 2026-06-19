"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { StickyNote } from "lucide-react";
import { EditNotesModal } from "./_components/EditNotesModal";
import { NotesCardProps } from "./interface";

export function NotesCard({
  companyClientId,
  companyClient,
  notes,
  onUpdated,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: NotesCardProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title
          size="sm"
          weight="semibold"
          className="inline-flex items-center gap-6"
        >
          Notas Privadas
          <HelpTooltip
            label="Sobre as notas privadas"
            content="Anotações internas sobre o cliente. Visíveis apenas para a sua equipe — o cliente não as vê."
          />
        </Card.Header.Title>
        <Card.Header.Actions>
          {companyClientId && (
            <EditNotesModal
              companyClientId={companyClientId}
              companyClient={companyClient}
              currentNotes={notes}
              onSuccess={onUpdated}
              onUpdateOptimistic={onUpdateOptimistic}
              onCommit={onCommit}
              onRollback={onRollback}
            />
          )}
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        {notes ? (
          <Title
            variant="caption"
            color="secondary"
            className="wrap-break-word whitespace-pre-wrap"
          >
            {notes}
          </Title>
        ) : (
          <EmptyState.Root flat>
            <EmptyState.Icon>
              <StickyNote size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Sem notas registradas</EmptyState.Title>
            <EmptyState.Description>
              Registre observações internas sobre este cliente. Só a sua equipe
              vê estas notas.
            </EmptyState.Description>
          </EmptyState.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}
