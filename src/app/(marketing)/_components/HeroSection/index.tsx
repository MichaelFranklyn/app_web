import { Title } from "@/components/Title";
import { MapPin } from "lucide-react";
import { TRIAL_DAYS } from "../../plans";
import { CtaLink } from "../CtaLink";
import { RouteTrail } from "../RouteTrail";
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
 * Redesenho de 19/11/2026: título grande e centrado (variante `hero`), com as
 * duas metades do ganho — a equipe sabe onde ir, o dono sabe o que recebe — e
 * o trajeto tracejado da marca nas laterais. A vitrine mostra prints reais.
 * O texto fica no servidor; só a vitrine é cliente.
 */
export function HeroSection() {
  return (
    <Section className="desktop:gap-[56px] relative isolate flex flex-col gap-40">
      {/* Brilho âmbar atrás do título. Decorativo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(55%_60%_at_50%_20%,var(--amber-bg)_0%,transparent_72%)]"
      />

      {/* O trajeto nas laterais: só no desktop, onde há margem para ele. */}
      <RouteTrail
        viewBox="0 0 220 420"
        path="M 200 10 C 120 60, 40 80, 60 170 S 190 260, 120 330 S 20 400, 10 410"
        stops={[
          { x: 60, y: 170 },
          { x: 120, y: 330 },
        ]}
        className="desktop:block absolute top-24 left-0 -z-10 hidden w-[200px]"
      />
      <RouteTrail
        viewBox="0 0 220 420"
        path="M 20 30 C 110 40, 200 110, 160 190 S 40 300, 210 400"
        stops={[{ x: 160, y: 190 }]}
        className="desktop:block absolute top-64 right-0 -z-10 hidden w-[200px]"
      />

      {/* Entrada em cascata: cada bloco sobe 70ms depois do anterior. Com
          movimento reduzido, a regra global zera a animação. */}
      <div className="[&>*]:animate-rise-in flex flex-col items-center gap-24 text-center [&>*:nth-child(2)]:[animation-delay:70ms] [&>*:nth-child(3)]:[animation-delay:140ms] [&>*:nth-child(4)]:[animation-delay:210ms] [&>*:nth-child(5)]:[animation-delay:280ms]">
        <span className="flex items-center gap-8 rounded-full border border-(--border) bg-(--bg) px-[14px] py-6 shadow-(--shadow-sm)">
          <MapPin aria-hidden className="size-[14px] stroke-(--color-action)" />
          <Title as="span" variant="body-sm" weight="medium" color="secondary">
            Para representações comerciais
          </Title>
        </span>

        <Title
          variant="hero"
          className="max-w-[17ch] leading-[1.02] text-balance"
        >
          Cada vendedor sabe quem visitar.{" "}
          <span className="text-(--color-action-text)">
            Você sabe quanto vai receber.
          </span>
        </Title>

        <Title
          variant="lead"
          color="secondary"
          className="max-w-[58ch] text-pretty"
        >
          Pedido, carteira, tabela de preço e comissão saem da planilha e do
          WhatsApp. E a semana da equipe já vem montada em rota, com os clientes
          que precisam de visita antes de pararem de comprar.
        </Title>

        <div className="flex flex-wrap items-center justify-center gap-12">
          <CtaLink href="/signup" size="lg">
            Testar {TRIAL_DAYS} dias grátis
          </CtaLink>

          <CtaLink href="#rotina" emphasis="secondary" size="lg">
            Ver a rotina funcionando
          </CtaLink>
        </div>

        <Title variant="body-sm" color="muted" className="max-w-[52ch]">
          Sem cartão. Nada para instalar: abre no navegador do computador e no
          celular do vendedor.
        </Title>
      </div>

      <HeroShowcase />
    </Section>
  );
}
