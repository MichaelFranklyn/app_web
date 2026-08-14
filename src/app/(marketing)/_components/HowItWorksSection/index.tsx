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
    <Section id="como-funciona">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="amber">
          Como começa
        </Title>

        <Title variant="heading-lg">Três passos, na ordem</Title>
      </div>

      <div className="desktop:grid-cols-3 mt-32 grid gap-16">
        {STEPS.map((step, index) => (
          <StepCard key={step.title} number={index + 1} {...step} />
        ))}
      </div>
    </Section>
  );
}
