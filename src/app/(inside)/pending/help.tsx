import { BulletList } from "@/components/BulletList";
import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

/**
 * As explicações da central de pendências.
 *
 * A dúvida que esta tela levanta é sempre a mesma: "resolvi, e agora, onde eu
 * dou baixa?". Não se dá — e é isso que precisa estar escrito.
 */
export const PENDING_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      Tudo o que está <Emphasis>esperando por você</Emphasis>, numa lista só:
    </Title>
    <BulletList.Root>
      <BulletList.Item>
        Visitas e ligações que passaram do dia sem resposta.
      </BulletList.Item>
      <BulletList.Item>
        Retornos que você combinou com o cliente.
      </BulletList.Item>
      <BulletList.Item>
        Pedidos parados: orçamento sem resposta, sem faturar ou sem confirmar a
        entrega.
      </BulletList.Item>
      <BulletList.Item>
        Clientes sem visita, ligação nem pedido fechado há mais de 30 dias.
        Orçamento não conta como contato. Se já houver visita marcada para esta
        semana, o cliente não aparece; marcada para mais adiante, ele aparece
        com a data da agenda.
      </BulletList.Item>
    </BulletList.Root>
    <Title variant="body-sm">
      A lista vem em ordem de <Emphasis>prioridade</Emphasis> e, dentro dela, do
      prazo mais antigo para o mais novo. Cada linha diz a conta que fez dela
      uma pendência, por exemplo: &quot;confirmado há 9 dias; prazo considerado:
      7 dias&quot;.
    </Title>
    <Title variant="body-sm">
      <Emphasis>Não existe botão de baixa.</Emphasis> Quando você responde a
      visita, fatura o pedido ou fala com o cliente, a pendência some da lista
      sozinha.
    </Title>
  </>
);

/** Colunas: string porque o texto vai no `title` do `<th>`. */
export const PENDING_COLUMN_HELP: Record<string, string> = {
  priority:
    "O quanto isto não pode esperar. Alta: resolva hoje. Média: nesta semana. Baixa: ainda está no prazo. Passe o mouse no selo para ver quando ele sobe para Alta.",
  pending: "O que está pendente e por quê.",
  client:
    "De quem é a pendência. Em pedido parado aparecem também a fábrica e o valor.",
  due: "O dia em que isto devia ter sido feito, ou o dia combinado com o cliente — e há quanto tempo venceu.",
  seller: "O vendedor responsável por esta pendência.",
  where:
    "Para onde a linha leva quando você clica nela: é lá que a pendência se resolve.",
};
