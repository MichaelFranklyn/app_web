import { TextLink } from "@/components/TextLink";
import { Title } from "@/components/Title";
import { PLANS, TRIAL_DAYS } from "../../plans";
import { CtaLink } from "../CtaLink";
import { Section } from "../Section";
import { PlanCard } from "./_components/PlanCard";
import { SeatCalculator } from "./_components/SeatCalculator";

/**
 * Os três planos, com DOIS caminhos distintos e propositalmente separados:
 * assinar (leva a `/assinar`, o fluxo de contratação) e testar (leva ao
 * `/signup`, que cria a conta de teste de {@link TRIAL_DAYS} dias).
 *
 * Antes os três cartões levavam ao cadastro, e isso mentia por omissão: quem
 * clicava no Básico esperando o Básico recebia uma conta trial, com outra
 * matriz de recursos e outros tetos.
 *
 * O Enterprise também passa por `/assinar`, mas cai numa tela que explica que o
 * valor é fechado em conversa — ele não tem preço de tabela.
 *
 * A MESMA seção serve a home e a `/precos`; lá o link para o comparativo sai,
 * porque a tabela está logo abaixo — um link que rola para o próprio lugar é
 * ruído que faz o leitor duvidar de onde está.
 */
export function PlansSection({
  showComparisonLink = true,
  tone = "raised",
}: {
  showComparisonLink?: boolean;
  /** O fundo: na home a seção cai entre duas `raised` e passa `default`. */
  tone?: "default" | "raised";
}) {
  return (
    <Section id="planos" tone={tone}>
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="heading-xl" className="leading-[1.08] text-balance">
          Escolha pelo tamanho da operação
        </Title>

        <Title variant="body-md" color="secondary">
          Assine direto o plano que couber na sua operação, ou comece pelo teste
          de {TRIAL_DAYS} dias — que abre com o sistema inteiro liberado,
          inclusive o motor de visita, e não pede cartão.
        </Title>
      </div>

      <div className="tablet:grid-cols-2 desktop-xl:grid-cols-4 mt-32 grid gap-16">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.code}
            {...plan}
            cta={
              <CtaLink
                href={`/assinar?plano=${plan.code}`}
                emphasis={plan.isHighlighted ? "primary" : "secondary"}
                className="w-full"
              >
                {plan.demoMonthlyPrice === null
                  ? "Falar sobre o Enterprise"
                  : `Assinar o ${plan.label}`}
              </CtaLink>
            }
          />
        ))}
      </div>

      <SeatCalculator />

      <div className="mt-24 flex flex-wrap items-center gap-x-24 gap-y-12">
        <TextLink href="/signup">
          <Title variant="body-sm" color="inherit" weight="semibold">
            Prefere experimentar antes? Teste {TRIAL_DAYS} dias grátis →
          </Title>
        </TextLink>

        {showComparisonLink && (
          <TextLink
            href="/precos"
            tone="inherit"
            underline="none"
            className="text-(--color-text-secondary)"
          >
            <Title variant="body-sm" color="inherit" weight="semibold">
              Ver o comparativo linha a linha →
            </Title>
          </TextLink>
        )}
      </div>
    </Section>
  );
}
