import { Title } from "@/components/Title";
import { TRIAL_DAYS } from "../../plans";
import { CtaLink } from "../CtaLink";
import { RouteTrail } from "../RouteTrail";
import { Section } from "../Section";

/**
 * Fechamento. Quem chegou até aqui rolou a página inteira — a única coisa que
 * falta é o caminho para o cadastro, sem mais argumento.
 *
 * Desde 19/11/2026 é a faixa escura (`ink`), a única que quebra a alternância
 * dos fundos: o trajeto tracejado da página chega aqui, na última parada.
 */
export function CtaSection() {
  return (
    <Section tone="ink" className="desktop:py-[96px] relative">
      <RouteTrail
        tone="inverse"
        viewBox="0 0 1200 200"
        path="M -40 40 C 80 40, 120 80, 160 80 S 360 190, 600 190 S 900 190, 1040 80 S 1160 40, 1240 40"
        stops={[
          { x: 160, y: 80 },
          { x: 1040, y: 80 },
        ]}
        className="tablet:block absolute inset-x-0 bottom-0 -z-10 hidden w-full opacity-60"
      />

      <div className="flex flex-col items-center gap-24 text-center">
        <Title
          variant="hero"
          color="inverse"
          className="max-w-[16ch] leading-[1.05] text-balance"
        >
          Comece pelo próximo pedido
        </Title>

        <Title variant="lead" color="inverse" className="max-w-[52ch]">
          Crie a conta da sua representação, suba uma tabela de preço e lance um
          pedido de verdade. São {TRIAL_DAYS} dias com tudo liberado — em uma
          tarde dá para ver se serve.
        </Title>

        <div className="flex flex-wrap items-center justify-center gap-12">
          <CtaLink href="/signup" size="lg">
            Testar {TRIAL_DAYS} dias grátis
          </CtaLink>

          <CtaLink href="/login" emphasis="inverse" size="lg">
            Já tenho conta
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}
