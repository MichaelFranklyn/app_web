"use client";

import { Card } from "@/components/Card";
import { Progress } from "@/components/Progress";
import { Title } from "@/components/Title";
import { PlanLimitUsage } from "@/services/plan";
import {
  Building2,
  Infinity as InfinityIcon,
  LucideIcon,
  Store,
  UserRound,
  Users,
} from "lucide-react";

const LIMIT_ICON: Record<string, LucideIcon> = {
  USERS: Users,
  SELLERS: UserRound,
  CLIENTS: Store,
  FACTORIES: Building2,
};

/**
 * A cor mede o APERTO, não o recurso.
 *
 * Verde enquanto sobra vaga, âmbar a partir de 80% (a hora de pedir mais antes
 * de o cadastro travar) e vermelho no teto. A barra era sempre âmbar: um teto
 * com duas vagas usadas de trinta parecia tão urgente quanto um estourado.
 */
const toneOf = (percent: number, isAtLimit: boolean) => {
  if (isAtLimit) return "red" as const;
  if (percent >= 80) return "amber" as const;
  return "green" as const;
};

/** Um teto do plano: quanto se usou, de quanto, e o quanto isso aperta. */
export function PlanLimitCard({ usage }: { usage: PlanLimitUsage }) {
  const unlimited = usage.limit === null;
  // Com teto, a barra satura em 100 mesmo se um downgrade tiver deixado a
  // empresa acima do limite.
  const percent = unlimited
    ? 0
    : Math.min(100, Math.round((usage.used / Math.max(usage.limit!, 1)) * 100));
  const tone = toneOf(percent, usage.isAtLimit);
  const Icon = unlimited ? InfinityIcon : LIMIT_ICON[usage.key];

  return (
    <Card.Kpi>
      <Card.Kpi.Label>
        {Icon && (
          <span aria-hidden className="shrink-0 text-(--muted2)">
            <Icon size={13} />
          </span>
        )}
        <span className="truncate capitalize">{usage.label}</span>
      </Card.Kpi.Label>

      <Card.Kpi.Value
        status={
          unlimited
            ? "neutral"
            : tone === "red"
              ? "urgente"
              : tone === "amber"
                ? "atencao"
                : "ok"
        }
      >
        {usage.used}
        {/* O espaço é literal: sem ele o texto do cartão sai "100de 100" para
            quem lê por leitor de tela ou procura a frase inteira. */}
        {!unlimited && (
          <>
            {" "}
            <span className="font-mono text-[14px] font-medium text-(--muted)">
              de {usage.limit}
            </span>
          </>
        )}
      </Card.Kpi.Value>

      {!unlimited && (
        <Progress.Bar value={percent} color={tone} className="h-[5px]" />
      )}

      <Card.Kpi.Delta>
        {unlimited ? (
          "sem limite neste plano"
        ) : usage.isAtLimit ? (
          <Title variant="micro" color="red">
            Limite atingido. Fale com o suporte para aumentar.
          </Title>
        ) : (
          `${percent}% do teto · ${usage.limit! - usage.used} ${
            usage.limit! - usage.used === 1 ? "vaga livre" : "vagas livres"
          }`
        )}
      </Card.Kpi.Delta>
    </Card.Kpi>
  );
}
