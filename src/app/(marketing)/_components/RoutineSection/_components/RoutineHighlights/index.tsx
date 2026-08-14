import { Title } from "@/components/Title";
import { CalendarCheck, ClipboardCheck, MapPin, Users } from "lucide-react";

/**
 * O que a equipe recebe do motor de visita — quatro entregas, não quatro etapas
 * de cálculo.
 *
 * Era uma lista numerada explicando como o sistema chega à recomendação. Foi
 * trocada de propósito: numeração sugere receita, e receita é o que não se
 * publica. Aqui cada item responde "o que isso faz por mim", que é a pergunta
 * de quem está avaliando.
 */
const HIGHLIGHTS = [
  {
    icon: Users,
    title: "A lista de quem procurar",
    text: "Todo dia, os clientes da carteira que precisam de contato — sem depender da memória de ninguém.",
  },
  {
    icon: MapPin,
    title: "A rota já organizada",
    text: "As visitas do dia saem na ordem que faz sentido no mapa, com o trajeto pronto para seguir do celular.",
  },
  {
    icon: CalendarCheck,
    title: "Seus compromissos em primeiro lugar",
    text: "Cliente com dia marcado continua com dia marcado. A sugestão preenche o resto da agenda, não atropela o combinado.",
  },
  {
    icon: ClipboardCheck,
    title: "O registro do que saiu da visita",
    text: "Pedido, combinados e observações ficam registrados na visita — e é isso que mantém a lista dos próximos dias afiada.",
  },
];

export function RoutineHighlights() {
  return (
    <ul className="flex flex-col gap-12">
      {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
        <li
          key={title}
          className="flex items-start gap-16 rounded-(--radius-md) border border-(--border) bg-(--bg) p-24"
        >
          <span className="flex size-32 shrink-0 items-center justify-center rounded-(--radius-full) bg-(--cyan-bg) text-(--cyan)">
            <Icon size={16} />
          </span>

          <div className="flex flex-col gap-4">
            <Title variant="heading-sm">{title}</Title>

            <Title variant="body-sm" color="muted">
              {text}
            </Title>
          </div>
        </li>
      ))}
    </ul>
  );
}
