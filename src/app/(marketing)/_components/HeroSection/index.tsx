import { Title } from "@/components/Title";
import { TRIAL_DAYS } from "../../plans";
import { CtaLink } from "../CtaLink";
import { Section } from "../Section";
import { HeroShowcase } from "./_components/HeroShowcase";

/**
 * Primeira dobra. A promessa em uma frase, as duas portas de entrada e o
 * produto de verdade logo abaixo.
 *
 * O texto fala com o gestor da representação — quem responde por várias
 * fábricas, uma equipe em campo e a conta da comissão no fim do mês. É ele quem
 * decide contratar; o vendedor chega depois, convidado.
 *
 * O painel ilustrado (quatro linhas com ícone) virou print em 14/11/2026: a
 * rota do dia no computador e a mesma rota no celular do vendedor. Texto em
 * coluna e print em largura cheia, empilhados — ao lado do texto o print
 * ficava com ~500px e nada nele se lia.
 *
 * Ainda em 14/11/2026 o print parado virou a `HeroShowcase`: cinco telas que se
 * apresentam sozinhas. O texto fica no servidor; só a vitrine é cliente.
 */
export function HeroSection() {
  return (
    <Section className="desktop:gap-40 relative isolate flex flex-col gap-48">
      {/* Brilho âmbar atrás do título: dá profundidade à primeira dobra sem
          competir com o texto. Decorativo, fora da árvore de acessibilidade. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_30%_30%,var(--amber-bg)_0%,transparent_70%)]"
      />

      {/* Entrada em cascata: cada bloco sobe 70ms depois do anterior. Com
          movimento reduzido, a regra global zera a animação.

          No desktop o texto vira duas colunas — título à esquerda, conversa e
          botões à direita. Empilhado, ele ocupava a dobra inteira e o produto
          começava abaixo dela; assim a vitrine entra na primeira tela. */}
      <div className="[&>*]:animate-rise-in desktop:grid desktop:grid-cols-[1.1fr_1fr] desktop:gap-x-64 desktop:gap-y-24 desktop:items-start flex flex-col gap-24 [&>*:nth-child(2)]:[animation-delay:70ms] [&>*:nth-child(3)]:[animation-delay:140ms] [&>*:nth-child(4)]:[animation-delay:210ms] [&>*:nth-child(5)]:[animation-delay:280ms]">
        <Title variant="eyebrow" color="amber" className="desktop:col-span-2">
          Para representações comerciais
        </Title>

        <Title
          variant="heading-xl"
          className="desktop:row-span-3 max-w-[24ch] text-balance"
        >
          O comercial da sua representação em um lugar só
        </Title>

        <Title variant="body-md" color="secondary" className="max-w-[60ch]">
          Pedido, carteira, tabela de preço e comissão deixam de morar em
          planilha, WhatsApp e caderno. E o Itinus aponta quais clientes
          precisam de visita e organiza a semana da equipe em rota — antes de
          eles pararem de comprar.
        </Title>

        <div className="flex flex-wrap items-center gap-12">
          <CtaLink href="/signup" size="lg">
            Testar {TRIAL_DAYS} dias grátis
          </CtaLink>

          <CtaLink href="#rotina" emphasis="secondary" size="lg">
            Ver a rotina funcionando
          </CtaLink>
        </div>

        <Title variant="body-sm" color="muted" className="max-w-[52ch]">
          {TRIAL_DAYS} dias com o sistema inteiro liberado, sem cartão. Nada
          para instalar: abre no navegador do computador e no celular do
          vendedor.
        </Title>
      </div>

      <HeroShowcase />
    </Section>
  );
}
