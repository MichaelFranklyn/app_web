import { Title } from "@/components/Title";

/**
 * O caminho do dado até a visita, em quatro degraus numerados. É o "como o
 * sistema sabe" da seção ao lado — quem lê a promessa desconfia, e o
 * mecanismo escrito em quatro linhas é o que responde à desconfiança.
 */
const STEPS = [
  {
    title: "Lê o histórico de compra",
    text: "Quanto tempo esse cliente costuma levar entre um pedido e o próximo, por fábrica.",
  },
  {
    title: "Estima o que sobrou na prateleira",
    text: "A entrega abastece o estoque do cliente e o consumo vai descontando dia após dia. O vendedor corrige na visita, quando olha.",
  },
  {
    title: "Mede a urgência e o lastro",
    text: "Cliente atrasado no ciclo sobe na lista. Cliente com pouco histórico sobe menos: o sistema pesa o quanto ele confia no próprio palpite.",
  },
  {
    title: "Monta a rota",
    text: "As visitas do dia saem agrupadas por região e ordenadas a partir do ponto de partida do vendedor, com o mapa e a lista para imprimir.",
  },
];

export function RoutineSteps() {
  return (
    <ol className="flex flex-col gap-12">
      {STEPS.map((step, index) => (
        <li
          key={step.title}
          className="flex items-start gap-16 rounded-(--radius-md) border border-(--border) bg-(--bg) p-24"
        >
          <span className="flex size-32 shrink-0 items-center justify-center rounded-(--radius-full) bg-(--cyan-bg) text-(--cyan)">
            <Title variant="value">{index + 1}</Title>
          </span>

          <div className="flex flex-col gap-4">
            <Title variant="heading-sm">{step.title}</Title>

            <Title variant="body-sm" color="muted">
              {step.text}
            </Title>
          </div>
        </li>
      ))}
    </ol>
  );
}
