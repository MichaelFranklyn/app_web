import { Title } from "@/components/Title";
import { Bell, ClipboardList, HandCoins, Route } from "lucide-react";

/**
 * O que a equipe encontra ao abrir o sistema, em quatro linhas.
 *
 * É uma ilustração do produto, não uma captura de tela com números de mentira:
 * cada linha nomeia uma tela que existe e o que ela responde. Números
 * inventados num painel de vitrine envelhecem mal — quem entra no teste compara
 * com o que vê e perde a confiança no resto da página.
 */
const ROWS = [
  {
    icon: Route,
    color: "var(--mod-routine)",
    label: "Rota do dia",
    text: "Quem visitar hoje, em que ordem, com o mapa pronto.",
  },
  {
    icon: ClipboardList,
    color: "var(--mod-orders)",
    label: "Pedidos",
    text: "O que está em aberto, faturado e entregue, por fábrica.",
  },
  {
    icon: HandCoins,
    color: "var(--amber)",
    label: "Comissões",
    text: "Quanto entra este mês e o que já foi recebido.",
  },
  {
    icon: Bell,
    color: "var(--mod-intel)",
    label: "Avisos",
    text: "Visita vencida, pedido parado, meta fora do ritmo.",
  },
];

export function HeroPanel() {
  return (
    <div className="rounded-(--radius-lg) border border-(--border) bg-(--bg2) p-24 shadow-(--shadow-md)">
      <Title variant="label" color="muted">
        A tela de segunda-feira
      </Title>

      <div className="mt-24 flex flex-col gap-16">
        {ROWS.map(({ icon: Icon, color, label, text }) => (
          <div key={label} className="flex items-start gap-12">
            <span
              className="mt-2 flex size-32 shrink-0 items-center justify-center rounded-(--radius-sm)"
              /* `color-mix` em vez de concatenar alfa no hexa: o valor aqui é
                 uma variável CSS (`var(--mod-routine)`), e string somada a ela
                 não é cor nenhuma — sairia sem fundo. */
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                color,
              }}
            >
              <Icon size={16} />
            </span>

            <div className="flex flex-col gap-4">
              <Title variant="heading-sm">{label}</Title>
              <Title variant="body-sm" color="muted">
                {text}
              </Title>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
