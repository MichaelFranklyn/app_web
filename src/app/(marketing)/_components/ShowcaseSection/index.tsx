import { Title } from "@/components/Title";
import { ScreenFrame } from "../ScreenFrame";
import { Section } from "../Section";

/**
 * O resto da operação em print (14/11/2026): a rotina é o centro, mas quem
 * decide contratar também quer ver onde ficam o pedido e a comissão.
 *
 * Três telas, não oito: a grade de recursos logo abaixo já nomeia todos os
 * módulos — aqui é só a prova de que eles existem e são assim.
 */
const SCREENS = [
  {
    title: "Pedidos",
    text: "Tudo o que a equipe vendeu, por situação: em aberto, faturado, entregue.",
    image: "/marketing/pedidos.webp",
    alt: "Lista de pedidos com o total vendido, o faturado e a comissão no topo, e cada pedido com cliente, fábrica, valor e situação.",
  },
  {
    title: "Comissões",
    text: "O que cada fábrica deve no mês, parcela por parcela, com a conferência marcada.",
    image: "/marketing/comissoes.webp",
    alt: "Comissões do mês: a receber, previsto e recebido, e as parcelas agrupadas por fábrica.",
  },
  {
    title: "Oportunidades",
    text: "Clientes no momento de recomprar e prioritários que ficaram fora da rota.",
    image: "/marketing/oportunidades.webp",
    alt: "Oportunidades: clientes no momento de recomprar e clientes prioritários fora da rotina.",
  },
];

export function ShowcaseSection() {
  return (
    <Section>
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="amber">
          Por dentro
        </Title>

        <Title variant="heading-lg">E o resto da operação no mesmo lugar</Title>
      </div>

      <ul className="desktop:grid-cols-3 mt-32 grid gap-32">
        {SCREENS.map(({ title, text, image, alt }) => (
          <li key={title} className="flex flex-col gap-16">
            <ScreenFrame
              src={image}
              alt={alt}
              sizes="(min-width: 1200px) 370px, 100vw"
            />
            <div className="flex flex-col gap-4">
              <Title as="h3" variant="heading-sm">
                {title}
              </Title>
              <Title variant="body-sm" color="muted">
                {text}
              </Title>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
