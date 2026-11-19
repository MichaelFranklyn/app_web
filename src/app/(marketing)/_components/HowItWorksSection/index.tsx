import { Title } from "@/components/Title";
import { Section } from "../Section";
import { StepCard } from "./_components/StepCard";

/**
 * O medo de quem avalia um sistema assim não é o preço — é o mês de digitação
 * antes de ver valor. Por isso os três passos falam de *migrar*, e o primeiro
 * deles é importar o que a representação já tem em planilha.
 */
const STEPS = [
  {
    title: "Traga o que você já tem",
    text: "Cadastre as fábricas que representa e suba clientes e tabelas de preço por planilha. Nada de recomeçar do zero.",
  },
  {
    title: "A equipe vende no padrão",
    text: "O vendedor abre o pedido pelo celular com o preço, o nível e o imposto certos. Você acompanha sem precisar pedir relatório a ninguém.",
  },
  {
    title: "O mês fecha sozinho",
    text: "Faturamento vira comissão, comissão vira o que se tem a receber por fábrica, e a agenda da semana seguinte já chega pronta.",
  },
];

export function HowItWorksSection() {
  return (
    <Section id="como-funciona" tone="raised">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="heading-xl" className="leading-[1.08] text-balance">
          Três passos, na ordem
        </Title>
      </div>

      {/* O trilho tracejado passa atrás dos pinos (no desktop, na horizontal;
          empilhado, na vertical), como as paradas de uma rota. */}
      <ol className="desktop:grid-cols-3 desktop:gap-48 desktop:before:top-[23px] desktop:before:bottom-auto desktop:before:left-24 desktop:before:right-24 desktop:before:border-l-0 desktop:before:border-t-2 relative mt-40 grid gap-40 before:absolute before:top-24 before:bottom-24 before:left-[23px] before:border-l-2 before:border-dashed before:border-(--color-action)/50 before:content-['']">
        {STEPS.map((step, index) => (
          <StepCard key={step.title} number={index + 1} {...step} />
        ))}
      </ol>
    </Section>
  );
}
