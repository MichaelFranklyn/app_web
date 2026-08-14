import { Title } from "@/components/Title";
import { Section } from "../Section";
import { PainCard } from "./_components/PainCard";

/**
 * O espelho: quatro situações que quem toca uma representação reconhece de
 * imediato. Vem antes dos recursos de propósito — lista de funcionalidade só
 * convence quem já concordou que tem um problema.
 *
 * Cada cartão descreve a rotina de hoje, sem prometer nada; a promessa é a
 * seção seguinte.
 */
const PAINS = [
  {
    title: "A tabela de preço certa é um achado",
    text: "Cada fábrica manda a sua, com nível de desconto, ST e IPI. O vendedor pergunta no grupo qual é a mais nova e o pedido sai com preço de dois meses atrás.",
  },
  {
    title: "A comissão é conferida na unha",
    text: "Faturou parcial, cortou item, mudou o prazo. No fim do mês alguém abre a planilha e recalcula tudo de novo para saber quanto a fábrica deve.",
  },
  {
    title: "O cliente some sem avisar",
    text: "Ninguém percebe que aquele cliente comprava todo mês e parou. Quando cai a ficha, ele já está comprando do concorrente há um trimestre.",
  },
  {
    title: "A rota do dia nasce na memória",
    text: "O vendedor decide na hora quem visitar, geralmente quem é mais simpático ou quem fica no caminho — e não quem está mais perto de parar de comprar.",
  },
];

export function ProblemSection() {
  return (
    <Section tone="raised">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="muted">
          O de sempre
        </Title>

        <Title variant="heading-lg">
          Não falta esforço na sua equipe. Falta o comercial num lugar só.
        </Title>
      </div>

      <div className="tablet:grid-cols-2 mt-32 grid gap-16">
        {PAINS.map((pain) => (
          <PainCard key={pain.title} {...pain} />
        ))}
      </div>
    </Section>
  );
}
