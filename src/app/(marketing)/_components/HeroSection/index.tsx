import { Title } from "@/components/Title";
import { TRIAL_DAYS } from "../../plans";
import { CtaLink } from "../CtaLink";
import { Section } from "../Section";
import { HeroPanel } from "./_components/HeroPanel";

/**
 * Primeira dobra. A promessa em uma frase, as duas portas de entrada e um
 * painel que mostra do que o dia da equipe é feito.
 *
 * O texto fala com o gestor da representação — quem responde por várias
 * fábricas, uma equipe em campo e a conta da comissão no fim do mês. É ele quem
 * decide contratar; o vendedor chega depois, convidado.
 */
export function HeroSection() {
  return (
    <Section className="desktop:grid-cols-[1.1fr_1fr] desktop:items-center grid gap-48">
      <div className="flex flex-col gap-24">
        <Title variant="eyebrow" color="amber">
          Para representações comerciais
        </Title>

        <Title variant="heading-xl" className="max-w-[16ch]">
          O comercial da sua representação em um lugar só
        </Title>

        <Title variant="body-md" color="secondary" className="max-w-[56ch]">
          Pedido, carteira, tabela de preço e comissão deixam de morar em
          planilha, WhatsApp e caderno. E, todo dia, o Girus diz quais clientes
          precisam de você — antes de eles pararem de comprar.
        </Title>

        <div className="flex flex-wrap items-center gap-12">
          <CtaLink href="/signup" size="lg">
            Testar {TRIAL_DAYS} dias grátis
          </CtaLink>

          <CtaLink href="#recursos" emphasis="secondary" size="lg">
            Ver o que faz
          </CtaLink>
        </div>

        <Title variant="body-sm" color="muted" className="max-w-[52ch]">
          {TRIAL_DAYS} dias com o sistema inteiro liberado, sem cartão. Nada
          para instalar: abre no navegador do computador e no celular do
          vendedor.
        </Title>
      </div>

      <HeroPanel />
    </Section>
  );
}
