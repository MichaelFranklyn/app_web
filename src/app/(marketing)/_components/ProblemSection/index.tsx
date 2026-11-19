import { Title } from "@/components/Title";
import { Section } from "../Section";
import { BeforeAfterRow } from "./_components/BeforeAfterRow";

/**
 * O espelho: quatro situações que quem toca uma representação reconhece de
 * imediato — e, desde 19/11/2026, a virada de cada uma ao lado. Vem antes dos
 * recursos de propósito: lista de funcionalidade só convence quem já
 * concordou que tem um problema.
 *
 * O "hoje" descreve a rotina sem exagero; o "com o Itinus" fala do resultado,
 * não do mecanismo.
 */
const PAINS = [
  {
    title: "A tabela de preço certa é um achado",
    before:
      "Cada fábrica manda a sua, com nível de desconto, ST e IPI. O vendedor pergunta no grupo qual é a mais nova e o pedido sai com preço de dois meses atrás.",
    after:
      "Cada fábrica com a sua tabela, nível e imposto dentro do sistema. O pedido já nasce com o preço em vigor.",
  },
  {
    title: "A comissão é conferida na unha",
    before:
      "Faturou parcial, cortou item, mudou o prazo. No fim do mês alguém abre a planilha e recalcula tudo para saber quanto a fábrica deve.",
    after:
      "A comissão nasce do faturado, parcela por parcela. No fim do mês, a conta já está feita por fábrica.",
  },
  {
    title: "O cliente some sem avisar",
    before:
      "Ninguém percebe que aquele cliente comprava todo mês e parou. Quando cai a ficha, ele já está comprando de outro há um trimestre.",
    after:
      "O cliente que passou do ritmo de compra aparece nas oportunidades — enquanto ainda dá tempo de visitar.",
  },
  {
    title: "A rota do dia nasce na memória",
    before:
      "O vendedor decide na hora quem visitar: quem é mais simpático ou quem fica no caminho, e não quem está perto de parar de comprar.",
    after:
      "A semana é montada por prioridade e agrupada por região. O vendedor abre o celular e a rota está lá.",
  },
];

export function ProblemSection() {
  return (
    <Section tone="raised">
      <div className="flex max-w-[720px] flex-col gap-12">
        <Title variant="heading-xl" className="leading-[1.08] text-balance">
          Não falta esforço na sua equipe. Falta o comercial num lugar só.
        </Title>

        <Title variant="body-md" color="secondary">
          Quatro cenas que toda representação conhece — e como elas ficam quando
          o comercial inteiro mora no mesmo sistema.
        </Title>
      </div>

      <ol className="mt-40 flex flex-col gap-16">
        {PAINS.map((pain) => (
          <BeforeAfterRow key={pain.title} {...pain} />
        ))}
      </ol>
    </Section>
  );
}
