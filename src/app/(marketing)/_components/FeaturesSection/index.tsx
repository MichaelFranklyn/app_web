import { Title } from "@/components/Title";
import { Section } from "../Section";
import { FeatureCard } from "./_components/FeatureCard";
import { FEATURES } from "./utils";

/**
 * Os módulos em bento (19/11/2026). Âncora `#recursos` — é para cá que aponta
 * o link do topo e o do rodapé (o segundo botão do hero aponta para `#rotina`).
 * Absorveu a antiga `ShowcaseSection`: os prints de pedidos, comissões e
 * oportunidades agora são recortes dentro dos próprios cartões.
 */
export function FeaturesSection() {
  return (
    <Section id="recursos">
      <div className="flex max-w-[680px] flex-col gap-12">
        <Title variant="heading-xl" className="leading-[1.08] text-balance">
          Da tabela de preço ao acerto da comissão
        </Title>

        <Title variant="body-md" color="secondary">
          Módulos que conversam entre si. O pedido alimenta a comissão, a
          entrega alimenta o estoque do cliente e o estoque alimenta a próxima
          visita.
        </Title>
      </div>

      <div className="tablet:grid-cols-2 desktop:grid-cols-4 mt-40 grid gap-16">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </Section>
  );
}
