/**
 * As partes da história das análises, na ordem em que a página as conta.
 *
 * A leitura foi montada como uma sequência de perguntas que se apoiam umas nas
 * outras, e não como um catálogo de métricas: primeiro o resultado, depois o que
 * o explica, de quem ele depende, e só então as três pessoas por trás dele
 * (cliente, vendedor, fábrica). O quanto sobra para o representante fecha a
 * história — é a consequência de tudo o que veio antes.
 *
 * Vive no pai porque é código compartilhado por irmãos: o roteiro do topo e cada
 * seção leem daqui o mesmo id, título e posição. Sem essa fonte única, mudar a
 * ordem exigiria acertar o "Parte 3 de 7" à mão em dois lugares.
 */
export interface StoryPart {
  /** Âncora da seção (usada pelo roteiro do topo). */
  id: string;
  /** Título curto, como aparece no roteiro. */
  label: string;
  /** A pergunta que a parte responde, em uma linha. */
  question: string;
}

export const ANALYTICS_STORY: StoryPart[] = [
  {
    id: "resultado",
    label: "Como o período fechou",
    question: "Quanto entrou e quantas vendas aconteceram.",
  },
  {
    id: "explicacao",
    label: "O que explica o resultado",
    question:
      "Se foi vender mais vezes, vender mais caro — e o que virou entrega.",
  },
  {
    id: "dependencia",
    label: "De quem vem o faturamento",
    question:
      "Quanto do dinheiro depende de poucos clientes e de poucas fábricas.",
  },
  {
    id: "carteira",
    label: "Sua carteira de clientes",
    question:
      "Quem chega, quem volta, quem está sumindo e de quanto em quanto tempo compra.",
  },
  {
    id: "vendas",
    label: "Quem vende e como vende",
    question:
      "O trabalho de campo: visita, carteira trabalhada e tamanho da venda.",
  },
  {
    id: "fabricas",
    label: "Como as fábricas atendem",
    question:
      "Se entregam no prazo, se faturam pela metade e que tipo de pedido rendem.",
  },
  {
    id: "comissoes",
    label: "Quanto sobra para você",
    question:
      "A comissão que entrou, a que está por entrar e a que está atrasada.",
  },
];

/** "Parte 3 de 7" — posição da parte na história, para o cabeçalho da seção. */
export const storyStep = (id: string): string => {
  const index = ANALYTICS_STORY.findIndex((part) => part.id === id);
  if (index < 0) return "";
  return `Parte ${index + 1} de ${ANALYTICS_STORY.length}`;
};
