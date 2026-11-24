import { Timeline } from "@/components/Timeline";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { ScrollText } from "lucide-react";
import { TenantAuditEntry } from "../../interface";
import { AUDIT_LABEL } from "../../utils";
import { formatLogMoment } from "@/utils/format/date";

export function TenantAuditCard({ entries }: { entries: TenantAuditEntry[] }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>Auditoria</Card.Header.Title>
        <Card.Header.Description>
          O que a plataforma fez nesta empresa. Ações do dia a dia da empresa
          não entram aqui.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {entries.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <ScrollText />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma ação registrada</EmptyState.Title>
            <EmptyState.Description>
              Suspensões, mudanças de plano e sessões de suporte aparecem aqui.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <Timeline.Root>
            {entries.map((entry) => (
              <Timeline.Item key={entry.id}>
                <div className="flex flex-wrap items-baseline gap-8">
                  <Title variant="caption" weight="semibold">
                    {AUDIT_LABEL[entry.action] ?? entry.action}
                  </Title>
                  <Title variant="micro" color="muted">
                    {formatLogMoment(entry.createdAt)} · {entry.actorEmail}
                  </Title>
                </div>
                {entry.reason && (
                  <Title variant="micro" color="muted">
                    {entry.reason}
                  </Title>
                )}
              </Timeline.Item>
            ))}
          </Timeline.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}
