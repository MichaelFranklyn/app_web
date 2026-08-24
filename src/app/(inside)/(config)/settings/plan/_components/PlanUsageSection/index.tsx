"use client";

import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { PlanLimitUsage } from "@/services/plan";

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
        </Title>
        <Title variant="body-sm" color="muted">
          Contagem do que está cadastrado hoje. O que foi excluído não ocupa
          vaga.
        </Title>
      </div>

      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
        {limits.map((usage) => (
          <Grid.Item key={usage.key}>
            <PlanLimitCard usage={usage} />
          </Grid.Item>
        ))}
      </Grid.Root>
    </section>
  );
}
