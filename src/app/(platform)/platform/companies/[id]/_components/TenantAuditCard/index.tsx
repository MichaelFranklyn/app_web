import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { ScrollText } from "lucide-react";
import { TenantAuditEntry } from "../../interface";
import { AUDIT_LABEL } from "../../utils";

const formatMoment = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  // Data e hora: duas ações do mesmo dia se distinguem pela hora, e é
  // justamente a sequência do dia que se reconstrói ao investigar.
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TenantAuditCard({ entries }: { entries: TenantAuditEntry[] }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Auditoria
        </Card.Header.Title>
        <Card.Header.Description>
          O que a plataforma fez nesta empresa. Ações do dia a dia da empresa
          não entram aqui.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {entries.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <ScrollText size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma ação registrada</EmptyState.Title>
            <EmptyState.Description>
              Suspensões, mudanças de plano e sessões de suporte aparecem aqui.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <ol className="flex flex-col gap-12">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-[2px] border-l-2 border-(--border) pl-12"
              >
                <div className="flex flex-wrap items-baseline gap-8">
                  <Title variant="caption" weight="semibold">
                    {AUDIT_LABEL[entry.action] ?? entry.action}
                  </Title>
                  <Title variant="micro" color="muted">
                    {formatMoment(entry.createdAt)} · {entry.actorEmail}
                  </Title>
                </div>
                {entry.reason && (
                  <Title variant="micro" color="muted">
                    {entry.reason}
                  </Title>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card.Body>
    </Card.Root>
  );
}
