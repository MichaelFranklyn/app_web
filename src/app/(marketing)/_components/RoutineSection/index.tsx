import { Title } from "@/components/Title";
import { Section } from "../Section";
import { RoutineSteps } from "./_components/RoutineSteps";

/**
 * O destaque da página: o motor de visita. Ganha seção própria porque é o que
 * nenhuma planilha faz — o resto do sistema organiza o que a representação já
 * faz; esta parte decide o que fazer amanhã.
 *
 * A copy evita a palavra "inteligência artificial" de propósito. O que existe
 * aqui é contagem de dias, cadência de compra e distância no mapa — dizer isso
 * em português sustenta a confiança melhor do que um rótulo da moda.
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
          O Girus acompanha o ritmo de compra de cada cliente e avisa quando ele
          sai desse ritmo. Não é palpite: é o intervalo entre os pedidos dele, o
          que a última entrega deixou na prateleira e há quanto tempo ninguém o
          procura.
        </Title>

        <Title variant="body-md" color="secondary" className="max-w-[52ch]">
          A lista do dia sai agrupada por região e ordenada no mapa, com as
          visitas de rota fixa entrando antes de qualquer sugestão — o
          compromisso que a equipe já assumiu manda no algoritmo, e não o
          contrário.
        </Title>
      </div>

      <RoutineSteps />
    </Section>
  );
}
