import { Title } from "@/components/Title";
import { Section } from "../Section";
import { RoutineHighlights } from "./_components/RoutineHighlights";

/**
 * O destaque da página: o motor de visita. Ganha seção própria porque é o que
 * nenhuma planilha faz — o resto do sistema organiza o que a representação já
 * faz; esta parte diz o que fazer amanhã.
 *
 * A copy fala do RESULTADO, não do mecanismo. A versão anterior explicava o
 * cálculo (intervalo entre pedidos, estoque descontado dia a dia, peso da
 * confiança, agrupamento por raio) — informação que é nossa, que o concorrente
 * copia de graça e que o cliente não precisa para decidir. Quem compra quer
 * saber que a lista chega pronta e acerta; como ela é montada é assunto de
 * dentro de casa.
 *
 * Também não aparece "inteligência artificial": prometer rótulo da moda para
 * quem vai usar a ferramenta todo dia cobra caro na primeira frustração.
 */
export function RoutineSection() {
  return (
    <Section
      tone="raised"
      className="desktop:grid-cols-[1fr_1.1fr] desktop:items-center grid gap-48"
    >
      <div className="flex flex-col gap-16">
        <Title variant="eyebrow" color="cyan">
          Motor de visita
        </Title>

        <Title variant="heading-lg" className="max-w-[18ch]">
          Segunda-feira já começa com a lista pronta
        </Title>

        <Title variant="body-md" color="secondary" className="max-w-[52ch]">
          O Girus acompanha o comportamento de compra da sua carteira e mostra,
          todo dia, quais clientes merecem atenção agora — antes de a conta
          esfriar.
        </Title>

        <Title variant="body-md" color="secondary" className="max-w-[52ch]">
          O vendedor abre o aplicativo e encontra a rota do dia montada, com os
          compromissos que a equipe já assumiu preservados. Nada de decidir o
          roteiro no estacionamento.
        </Title>
      </div>

      <RoutineHighlights />
    </Section>
  );
}
