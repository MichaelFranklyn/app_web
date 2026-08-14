import { Title } from "@/components/Title";
import { Section } from "../Section";
import { FeatureCard } from "./_components/FeatureCard";
import { FEATURES } from "./utils";

/**
 * A grade dos módulos. Âncora `#recursos` — é para cá que apontam o link do
 * topo e o segundo botão do hero.
 */
export function FeaturesSection() {
  return (
    <Section id="recursos">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="amber">
          Recursos
        </Title>

        <Title variant="heading-lg">
          Da tabela de preço ao acerto da comissão
        </Title>

        <Title variant="body-md" color="secondary">
          Oito módulos que conversam entre si. O pedido alimenta a comissão, a
          entrega alimenta o estoque do cliente e o estoque alimenta a próxima
          visita.
        </Title>
      </div>

      <div className="tablet:grid-cols-2 desktop:grid-cols-4 mt-32 grid gap-16">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </Section>
  );
}
