import { Title } from "@/components/Title";
import { TRIAL_DAYS } from "../../plans";
import { CtaLink } from "../CtaLink";
import { Section } from "../Section";

/**
 * Fechamento. Quem chegou até aqui rolou a página inteira — a única coisa que
 * falta é o caminho para o cadastro, sem mais argumento.
 */
export function CtaSection() {
  return (
    <Section tone="raised">
      <div className="flex flex-col items-center gap-24 text-center">
        <Title variant="heading-lg" className="max-w-[20ch]">
          Comece pelo próximo pedido
        </Title>

        <Title variant="body-md" color="secondary" className="max-w-[52ch]">
          Crie a conta da sua representação, suba uma tabela de preço e lance um
          pedido de verdade. São {TRIAL_DAYS} dias com tudo liberado — em uma
          tarde dá para ver se serve.
        </Title>

        <div className="flex flex-wrap items-center justify-center gap-12">
          <CtaLink href="/signup" size="lg">
            Testar {TRIAL_DAYS} dias grátis
          </CtaLink>

          <CtaLink href="/login" emphasis="secondary" size="lg">
            Já tenho conta
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}
