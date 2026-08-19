import { ReactNode } from "react";

import { CommissionTab } from "./utils";

/**
 * O texto de ajuda de cada peça da tela de comissões, num lugar só.
 *
 * Comissão é o assunto em que o usuário menos perdoa dúvida: ele está
 * conferindo dinheiro contra a planilha que a fábrica mandou. E a tela tem dois
 * recortes ao mesmo tempo (o mês, lá em cima, e a situação, nas abas) que NÃO
 * governam as mesmas coisas — quem não sabe disso acha que o sistema está
 * somando errado. Cada explicação abaixo diz o que a peça mostra e, quando é o
 * caso, o que ela ignora.
 *
 * Fica no pai porque a página e os componentes de `_components/` leem os mesmos
 * textos: a explicação da aba "Boleto em atraso" tem de ser a mesma no botão,
 * no aviso e no cartão da fábrica.
 */

/** Abas que NÃO obedecem ao mês escolhido no navegador. */
const TABS_IGNORING_MONTH: CommissionTab[] = ["overdue"];

/** A aba escolhida ignora o mês do navegador? */
export const ignoresMonth = (tab: CommissionTab): boolean =>
  TABS_IGNORING_MONTH.includes(tab);

/** O que cada situação mostra — e qual delas foge do mês escolhido. */
export const TAB_HELP: Record<CommissionTab, ReactNode> = {
  receivable: (
    <p>
      O que a fábrica ainda tem de pagar, com data de recebimento dentro do mês
      escolhido. Já vem <b>líquido</b>: estorno descontado e devolução somada.
    </p>
  ),
  pending: (
    <p>
      Comissão que ainda depende de algo acontecer — a fábrica faturar ou o
      cliente pagar o boleto. Ainda não dá para cobrar.
    </p>
  ),
  received: (
    <p>
      O que a fábrica já repassou, com data dentro do mês escolhido. Serve para
      conferir o que entrou.
    </p>
  ),
  overdue: (
    <>
      <p>
        Boletos que o cliente não pagou: vencidos e em aberto, mais os já
        confirmados como calote. É o dinheiro travado.
      </p>
      <p>
        <b>Esta aba não segue o mês escolhido.</b> Ela mostra todos os
        vencimentos de uma vez, porque a cobrança é conferida contra o relatório
        da fábrica — que vem com boletos de meses diferentes na mesma folha.
      </p>
    </>
  ),
  all: (
    <p>
      Todas as parcelas do mês escolhido, em qualquer situação: previstas, a
      receber, recebidas e estornos.
    </p>
  ),
};

/** Aviso que aparece na tela (não só no “?”) quando a aba foge do mês. */
export const monthIgnoredNotice = (monthName: string): ReactNode => (
  <>
    Esta aba mostra boletos travados de <b>todos os vencimentos</b>, não só de{" "}
    {monthName}. Os três cartões lá em cima continuam somando {monthName}.
  </>
);

export const MONTH_HELP: ReactNode = (
  <>
    <p>
      As setas trocam o mês; o botão do meio volta para o mês atual. O mês vale
      para os três cartões acima, para os cartões de cada fábrica e para o PDF.
    </p>
    <p>
      O mês é o da data em que a comissão <b>cai</b> — não a do pedido. Um
      pedido faturado em junho, com prazo de 30 dias, aparece em julho.
    </p>
  </>
);

export const KPI_RECEIVABLE_HELP: ReactNode = (
  <p>
    Soma do que há a receber no mês escolhido, já descontados os estornos. Segue
    o mês e os filtros; <b>não muda com a aba</b> que você escolher abaixo.
  </p>
);

export const KPI_PENDING_HELP: ReactNode = (
  <p>
    Soma do que ainda depende de faturamento ou do pagamento do cliente no mês
    escolhido. Segue o mês e os filtros; não muda com a aba.
  </p>
);

export const KPI_RECEIVED_HELP: ReactNode = (
  <p>
    Soma do que a fábrica já repassou no mês escolhido. Segue o mês e os
    filtros; não muda com a aba.
  </p>
);

export const FILTERS_HELP: ReactNode = (
  <>
    <p>
      Os filtros valem para a <b>tela inteira</b>: os cartões de cima, os
      cartões de cada fábrica e a lista de estornos do vendedor.
    </p>
    <p>
      Com algum filtro ligado, aparece aqui do lado quantas parcelas passaram —
      assim um recorte esquecido não explica sozinho um total menor.
    </p>
  </>
);

export const PDF_HELP: ReactNode = (
  <p>
    O PDF traz só o que há <b>a receber</b> no mês escolhido, agrupado por
    fábrica: é o papel de cobrar o repasse. Ele não segue a aba, e não lista o
    que já foi recebido nem o que está previsto.
  </p>
);

export const SELLER_SELECT_HELP: ReactNode = (
  <p>
    Escolha de quem você quer ver as comissões. Ao trocar de vendedor o mês
    continua o mesmo, para comparar o mesmo fechamento entre eles.
  </p>
);

export const CHARGEBACK_PANEL_HELP: ReactNode = (
  <>
    <p>
      Comissão já repassada de boletos que o cliente acabou não pagando: o valor
      volta e é descontado do vendedor num fechamento.
    </p>
    <p>
      <b>Esta lista não segue o mês nem a aba.</b> Um estorno sem mês definido
      não cairia em fechamento nenhum, e ele precisa aparecer antes de o
      dinheiro faltar.
    </p>
  </>
);
