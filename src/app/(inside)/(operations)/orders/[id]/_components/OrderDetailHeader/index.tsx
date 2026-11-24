"use client";

import { isQuoteStatus } from "@/app/(inside)/_shared/orderStatus";
import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { formatDateDMY } from "@/utils/format/masks";
import { clientName, factoryName } from "@/utils/company";
import { formatOrderNumber } from "@/utils/orderNumber";
import { OrderDetail } from "../../interface";
import { OrderHeaderActions } from "./OrderHeaderActions";

interface Props {
  order: OrderDetail;
  onRefetch: () => void;
}

export function OrderDetailHeader({ order, onRefetch }: Props) {
  // Orçamento (rascunho/enviado): ainda não é pedido de fato — não fatura, mas
  // pode ser convertido em pedido.
  const isQuote = isQuoteStatus(order.status);

  return (
    <div className="flex flex-col gap-8">
      <div className="print-hide">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/orders">Pedidos</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            Pedido {formatOrderNumber(order.number)}
          </Breadcrumb.Item>
        </Breadcrumb.Root>
      </div>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.orders}>
              Pedido {formatOrderNumber(order.number)}
            </PanelHeader.Heading>
            {/* O cliente abre a descrição e o título fica só "Pedido N": curto,
                não quebra no celular e casa com o breadcrumb (14/11/2026).
                Duas linhas — quem/de onde, depois quem vendeu/quando — em vez
                de uma fila de cinco itens que quebrava em qualquer ponto; o
                "código" (prefixo do id) saiu: ninguém o procura mais desde a
                numeração (crítica de /orders/[id], 23/11/2026). */}
            <PanelHeader.Description>
              {clientName(order.client)} · {factoryName(order.factory)}
              <br />
              {order.seller?.name ?? "—"} · {formatDateDMY(order.orderDate)}
            </PanelHeader.Description>

            {/* As tarjas dizem em que pé está o pedido; o `title` explica o
                que cada estado significa para quem ainda não domina o fluxo
                (orçamento → confirmado → faturado → entregue). */}
            {/* O cliente pediu pelo portal: ninguém do escritório digitou
                nada — preço, condição e frete precisam ser conferidos antes
                de converter. */}
            {/* Histórico da migração: o número é o do sistema antigo, e a
                falta de comissão e boleto é esperada, não defeito. */}
            {/* Tarjas e ações na faixa padrão (PanelHeader.Tags): as tarjas
                primeiro (o estado), os botões depois; no celular, uma por linha. */}
            <PanelHeader.Tags>
              {order.isImported && (
                <>
                  <Badge.Root
                    size="sm"
                    appearance="tinted"
                    color="neutral"
                    title="Pedido trazido do sistema antigo na migração. Entrou como entregue e não gera comissão nem boleto aqui."
                  >
                    <Badge.Text>
                      Histórico importado
                      {order.externalRef ? ` · nº ${order.externalRef}` : ""}
                    </Badge.Text>
                  </Badge.Root>
                </>
              )}

              {order.isFromPortal && (
                <>
                  <Badge.Root
                    size="sm"
                    appearance="tinted"
                    color="purple"
                    title="O próprio cliente pediu estes produtos pelo portal. O preço veio da tabela no nível dele (ou da última compra); confira preço, condição de pagamento e frete antes de converter em pedido."
                  >
                    <Badge.Text>Pedido do cliente pelo portal</Badge.Text>
                  </Badge.Root>
                </>
              )}

              {/* Cancelado continua na lista de propósito; a tarja diz quando,
                quem e por quê — é a pergunta de quem acha o pedido depois. */}
              {order.status === "CANCELLED" && (
                <>
                  <Badge.Root
                    size="sm"
                    appearance="tinted"
                    color="red"
                    title={
                      order.cancelReason
                        ? `Motivo: ${order.cancelReason}`
                        : "Pedido cancelado: não conta nas vendas, nas metas nem nos relatórios."
                    }
                  >
                    <Badge.Text>
                      Cancelado
                      {order.cancelledAt
                        ? ` em ${formatDateDMY(order.cancelledAt)}`
                        : ""}
                      {order.cancelledByName
                        ? ` por ${order.cancelledByName}`
                        : ""}
                      {order.cancelReason ? ` · ${order.cancelReason}` : ""}
                    </Badge.Text>
                  </Badge.Root>
                </>
              )}

              {isQuote && (
                <>
                  <Badge.Root
                    size="sm"
                    appearance="tinted"
                    color="blue"
                    title="Orçamento ainda não é pedido: não gera nota, nem parcelas, nem comissão. Use “Converter em pedido” quando o cliente fechar."
                  >
                    <Badge.Text>
                      {order.status === "SENT"
                        ? "Orçamento enviado"
                        : "Orçamento"}
                    </Badge.Text>
                  </Badge.Root>
                </>
              )}

              {/* Enviado: quando e por quem. A tarja existe porque a pergunta
                aparece do outro lado — a fábrica dizendo que não recebeu. */}
              {order.sentAt && (
                <>
                  <Badge.Root
                    size="sm"
                    appearance="tinted"
                    color="green"
                    title={
                      order.sentNote
                        ? `Observação de quem enviou: ${order.sentNote}`
                        : "Registro do envio do pedido para a fábrica. O envio em si sai pelo WhatsApp; aqui fica a data, o autor e o canal."
                    }
                  >
                    <Badge.Text>
                      Enviado à fábrica em {formatDateDMY(order.sentAt)}
                      {order.sentByName ? ` por ${order.sentByName}` : ""}
                    </Badge.Text>
                  </Badge.Root>
                </>
              )}

              {/* Fechado com o cliente e NÃO mandado para a fábrica: é a
                pendência mais cara da operação, porque o pedido existe só aqui
                dentro. Só aparece em pedido de fato (orçamento ainda não tem o
                que mandar) e antes do faturamento. */}
              {!order.sentAt &&
                !isQuote &&
                !order.invoicedAt &&
                order.status !== "CANCELLED" && (
                  <>
                    <Badge.Root
                      size="sm"
                      appearance="tinted"
                      color="red"
                      title="O cliente fechou, mas o pedido não foi mandado para a fábrica — ou foi mandado por fora e ninguém registrou. Use “Enviar à fábrica”."
                    >
                      <Badge.Text>Não enviado à fábrica</Badge.Text>
                    </Badge.Root>
                  </>
                )}

              {order.deliveredAt && (
                <>
                  <Badge.Root
                    size="sm"
                    appearance="tinted"
                    color="green"
                    title="Dia em que a mercadoria chegou na loja do cliente. É essa data que reabastece o estoque estimado dele e alimenta a próxima visita."
                  >
                    <Badge.Text>
                      Entregue em {formatDateDMY(order.deliveredAt)}
                    </Badge.Text>
                  </Badge.Root>
                </>
              )}

              {/* Faturado, não entregue: mostra a previsão; vencida → alerta. */}
              {!order.deliveredAt && order.estimatedDeliveryDate && (
                <>
                  <Badge.Root
                    size="sm"
                    appearance="tinted"
                    color={order.isDeliveryOverdue ? "red" : "blue"}
                    title={
                      order.isDeliveryOverdue
                        ? "A previsão de entrega (data da nota + prazo da fábrica) já passou e ninguém confirmou a chegada. Confirme em “Marcar como entregue” — é o que atualiza o estoque do cliente."
                        : "Previsão calculada a partir da data da nota mais o prazo de entrega da fábrica. Quando a mercadoria chegar, confirme a entrega."
                    }
                  >
                    <Badge.Text>
                      {order.isDeliveryOverdue
                        ? `Entrega atrasada (prevista ${formatDateDMY(order.estimatedDeliveryDate)}) — confirme`
                        : `Entrega prevista: ${formatDateDMY(order.estimatedDeliveryDate)}`}
                    </Badge.Text>
                  </Badge.Root>
                </>
              )}
              <PanelHeader.Actions>
                <OrderHeaderActions order={order} onRefetch={onRefetch} />
              </PanelHeader.Actions>
            </PanelHeader.Tags>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
