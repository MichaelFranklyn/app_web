"use client";

import { Card } from "@/components/Card";
import { Alert } from "@/components/Alert";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { PlanLimitUsage } from "@/services/plan";
import { Infinity as InfinityIcon } from "lucide-react";

import { PlanLimitCard } from "../PlanLimitCard";

/**
 * Os tetos do plano, um cartão cada.
 *
 * Eram quatro linhas dentro de um card só, com uma barra âmbar em todas: para
 * saber qual estava apertado era preciso comparar quatro frases pequenas. Como
 * cartões, o número que importa fica grande e a cor responde antes da leitura.
 */
export function PlanUsageSection({ limits }: { limits: PlanLimitUsage[] }) {
  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <Title
          variant="heading-sm"
          className="inline-flex items-center gap-6 self-start"
        >
          Limites
          <HelpTooltip
            label="O que acontece quando um limite enche?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" weight="semibold">
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
        </Title>
        <Title variant="body-sm" color="muted">
          Contagem do que está cadastrado hoje. O que foi excluído não ocupa
          vaga.
        </Title>
      </div>

      {/* Tudo sem teto: quatro cartões com "∞" ocupavam meia tela para dizer
          uma coisa só. Uma faixa diz o mesmo e devolve o espaço (crítica de
          configurações, 23/11/2026). */}
      {limits.every((usage) => usage.limit === null) ? (
        <Alert.Root variant="neutral" size="sm">
          <Alert.Icon icon={InfinityIcon} />
          <Alert.Content>
            <Alert.Description>
              Sem limite de cadastro no seu plano:{" "}
              {limits.map((usage) => usage.label.toLowerCase()).join(", ")}.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <Card.Kpi.Group>
          {limits.map((usage) => (
            <PlanLimitCard key={usage.key} usage={usage} />
          ))}
        </Card.Kpi.Group>
      )}
    </section>
  );
}
