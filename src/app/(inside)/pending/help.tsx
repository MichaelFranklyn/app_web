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
      Tudo o que está <Emphasis>esperando por você</Emphasis>, num lugar só. É a
      única lista de trabalho do sistema — o que aparece resumido em outra tela
      leva para cá.
    </Title>
    <BulletList.Root>
      <BulletList.Item>
        <Emphasis>Visita sem resposta:</Emphasis> estava na rotina, o dia passou
        e ninguém disse o que houve.
      </BulletList.Item>
      <BulletList.Item>
        <Emphasis>Frequência de visita vencida:</Emphasis> ninguém marcou nada —
        é o ciclo de visita do cliente que passou, e não há visita marcada nesta
        semana.
      </BulletList.Item>
      <BulletList.Item>
        <Emphasis>Cliente sem contato:</Emphasis> nem visita, nem ligação, nem
        pedido fechado há mais de 30 dias. Orçamento não conta como contato;
        contato agendado concluído conta. Quem está aqui não aparece também em
        &quot;frequência vencida&quot; — o problema é um só.
      </BulletList.Item>
      <BulletList.Item>
        Contatos agendados e retornos que você combinou com o cliente.
      </BulletList.Item>
      <BulletList.Item>
        Pedidos parados: orçamento sem resposta, sem faturar ou sem confirmar a
        entrega (com o WhatsApp do pós-venda à mão).
      </BulletList.Item>
      <BulletList.Item>
        <Emphasis>Cobranças:</Emphasis> boletos vencidos, um por pedido, com as
        parcelas, o valor em aberto e o vencimento mais antigo. Têm cartão
        próprio e continuam vencidos até o pagamento ser baixado no pedido.
        Conferir a comissão não é pagar: o boleto só sai daqui quando é pago,
        cancelado ou marcado como não pago — a idade da dívida não diminui a
        prioridade.
      </BulletList.Item>
      <BulletList.Item>
        Endereços que o mapa não achou: não têm prazo, mas tiram o cliente da
        rotina até serem corrigidos.
      </BulletList.Item>
    </BulletList.Root>
    <Title variant="body-sm">
      Cada <Emphasis>cartão</Emphasis> é um assunto: quantas pendências, as mais
      urgentes e a lista completa, que abre na própria página. Os números do
      topo filtram tudo pelo prazo: <Emphasis>Atrasadas</Emphasis>,{" "}
      <Emphasis>Hoje</Emphasis> e <Emphasis>Próximos 7 dias</Emphasis>. Dentro
      de cada assunto a ordem é a de trabalho: prioridade e, nela, do prazo mais
      antigo para o mais novo. Cada linha diz a conta que fez dela uma
      pendência.
    </Title>
    <Title variant="body-sm">
      <Emphasis>Não existe botão de baixa.</Emphasis> Quando você responde a
      visita, fatura o pedido, recebe o boleto ou fala com o cliente, a
      pendência some da lista sozinha.
    </Title>
  </>
);
