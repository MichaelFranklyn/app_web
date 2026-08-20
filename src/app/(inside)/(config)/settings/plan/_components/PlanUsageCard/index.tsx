import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Progress } from "@/components/Progress";
import { Title } from "@/components/Title";
import { PlanLimitUsage } from "@/services/plan";

/** Uma linha por teto: quanto se usou, de quanto, e a barra que mostra o aperto. */
function UsageRow({ usage }: { usage: PlanLimitUsage }) {
  const unlimited = usage.limit === null;
  // Sem teto não há proporção a desenhar; com teto, a barra satura em 100 mesmo
  // se um downgrade tiver deixado a empresa acima do limite.
  const percent = unlimited
    ? 0
    : Math.min(100, Math.round((usage.used / Math.max(usage.limit!, 1)) * 100));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <Title variant="caption" weight="semibold" className="capitalize">
          {usage.label}
        </Title>
        <Title variant="micro" color={usage.isAtLimit ? "red" : "muted"}>
          {unlimited
            ? `${usage.used} · sem limite`
            : `${usage.used} de ${usage.limit}`}
        </Title>
      </div>

      {!unlimited && (
        <Progress value={percent} color={usage.isAtLimit ? "red" : "amber"} />
      )}

      {usage.isAtLimit && (
        <Title variant="micro" color="red">
          Limite atingido. Fale com o suporte para aumentar.
        </Title>
      )}
    </div>
  );
}

export function PlanUsageCard({ limits }: { limits: PlanLimitUsage[] }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title
          size="sm"
          weight="semibold"
          className="inline-flex items-center gap-6"
        >
          Limites
          <HelpTooltip
            label="O que acontece quando um limite enche?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Limite atingido
                </Title>
                <Title variant="body-sm">
                  O botão de adicionar recusa o cadastro e explica o motivo. O
                  que já existe continua funcionando normalmente — nada é
                  apagado nem bloqueado.
                </Title>
                <Title variant="body-sm" color="muted">
                  Excluir um registro devolve a vaga na hora. &quot;Sem
                  limite&quot; significa que aquele teto não existe no seu
                  plano, e a barra nem aparece.
                </Title>
              </div>
            }
          />
        </Card.Header.Title>
        <Card.Header.Description>
          Contagem do que está cadastrado hoje. O que foi excluído não ocupa
          vaga.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-16">
          {limits.map((usage) => (
            <UsageRow key={usage.key} usage={usage} />
          ))}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
