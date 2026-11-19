import { Title } from "@/components/Title";
import { Section } from "../Section";
import { RoutineStep } from "./_components/RoutineStep";

/**
 * O destaque da página: a rotina de visitas, o núcleo do produto. Ganha seção
 * própria porque é o que nenhuma planilha faz — o resto do sistema organiza o
 * que a representação já faz; esta parte diz o que fazer na semana.
 *
 * A copy fala do RESULTADO, não do mecanismo. Explicar o cálculo (intervalo
 * entre pedidos, estoque, agrupamento por raio) é informação nossa, que o
 * concorrente copia de graça e que o cliente não precisa para decidir.
 * Também não aparece "inteligência artificial": rótulo da moda cobra caro na
 * primeira frustração.
 *
 * Desde 14/11/2026 cada passo vem com o print da tela; desde 19/11/2026 os
 * passos são paradas num trilho tracejado, cada uma com o seu "quando". A numeração aqui é a
 * semana do VENDEDOR (o que ele faz), não a receita do motor — e por isso
 * pode ser numerada.
 */
const STEPS = [
  {
    when: "Segunda, antes de sair",
    title: "Escolha quem entra na semana",
    text: "A carteira aparece em ordem de prioridade: quem está na hora de recomprar e quem está há tempo sem visita vêm primeiro. O vendedor marca os clientes e segue.",
    image: "/marketing/montar-semana.webp",
    alt: "Tela Montar semana: lista de clientes com prioridade e motivo, e cinco clientes já marcados para a semana.",
  },
  {
    when: "Um clique depois",
    title: "O Itinus distribui pelos dias",
    text: "Um clique e as visitas se espalham pela semana, agrupadas por região. O dia que já estava combinado com o cliente continua combinado.",
    image: "/marketing/organizar-semana.webp",
    alt: "Janela Organizar a semana, que distribui os clientes escolhidos pelos dias úteis.",
  },
  {
    when: "A semana toda",
    title: "A semana inteira à vista",
    text: "Visitas e ligações de cada dia num quadro só. O gestor acompanha a equipe sem precisar perguntar a ninguém.",
    image: "/marketing/agenda-semana.webp",
    alt: "Agenda da semana: total de visitas e contatos no topo e os cartões de cada dia, de terça a sexta.",
  },
  {
    when: "Cada dia",
    title: "No dia, a rota está pronta",
    text: "A ordem das paradas, a distância e o tempo de estrada, com o mapa para seguir do celular. Quem não coube na visita entra como ligação ou WhatsApp.",
    image: "/marketing/rota-mapa.webp",
    alt: "Rota do dia: quatro paradas, 23,7 km de rota otimizada, o ponto de partida e o mapa com o trajeto.",
  },
];

export function RoutineSection() {
  return (
    <Section id="rotina">
      <div className="flex max-w-[680px] flex-col gap-12">
        <Title variant="heading-xl" className="leading-[1.08] text-balance">
          Segunda-feira já começa com a rota pronta
        </Title>

        <Title variant="body-md" color="secondary">
          O Itinus acompanha o comportamento de compra da sua carteira e mostra
          quais clientes merecem atenção agora — antes de a conta esfriar. Do
          planejamento da semana ao trajeto do dia, nada de decidir o roteiro no
          estacionamento.
        </Title>
      </div>

      {/* O trilho tracejado liga as paradas: a semana do vendedor é um
          trajeto, do planejamento à estrada. */}
      <ol className="desktop:gap-64 relative mt-48 flex flex-col gap-48 before:absolute before:top-16 before:bottom-16 before:left-[15px] before:border-l-2 before:border-dashed before:border-(--color-action)/50 before:content-['']">
        {STEPS.map((step, index) => (
          <RoutineStep
            key={step.title}
            number={index + 1}
            reverse={index % 2 === 1}
            {...step}
          />
        ))}
      </ol>
    </Section>
  );
}
