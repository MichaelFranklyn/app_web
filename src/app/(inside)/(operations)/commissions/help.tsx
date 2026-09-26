import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

import type { CommissionAudience } from "./utils";
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
    <Title variant="body-sm">
      O que a fábrica ainda tem de pagar, com data de recebimento dentro do mês
      escolhido. Já vem <Emphasis>líquido</Emphasis>: estorno descontado e
      devolução somada.
    </Title>
  ),
  pending: (
    <Title variant="body-sm">
      Comissão que ainda depende de algo acontecer — a fábrica faturar ou o
      cliente pagar o boleto. Ainda não dá para cobrar.
    </Title>
  ),
  received: (
    <Title variant="body-sm">
      O que a fábrica já repassou, com data dentro do mês escolhido. Serve para
      conferir o que entrou.
    </Title>
  ),
  overdue: (
    <>
      <Title variant="body-sm">
        Boletos que o cliente não pagou: vencidos e em aberto, mais os já
        confirmados como calote. É o dinheiro travado.
      </Title>
      <Title variant="body-sm">
        <Emphasis>Esta aba não segue o mês escolhido.</Emphasis> Ela mostra
        todos os vencimentos de uma vez, porque a cobrança é conferida contra o
        relatório da fábrica — que vem com boletos de meses diferentes na mesma
        folha.
      </Title>
    </>
  ),
  all: (
    <Title variant="body-sm">
      Todas as parcelas do mês escolhido, em qualquer situação: previstas, a
      receber, recebidas e estornos.
    </Title>
  ),
};

/**
 * O que a lista logo abaixo está mostrando, escrito.
 *
 * A tela tem DOIS recortes que não governam as mesmas coisas — o mês, lá em
 * cima, e a situação, nas abas — e é essa combinação que faz o gestor achar que
 * o sistema está somando errado. Um "?" não resolve: ninguém abre um tooltip
 * para conferir uma soma. A frase fica sempre visível, e muda com o recorte.
 *
 * A aba de boletos travados é a exceção que precisa ser dita em voz alta: ela
 * ignora o mês, e sem isso escrito a lista maior que os cartões parece um erro.
 */
export const scopeSentence = (
  tab: CommissionTab,
  monthName: string,
  /**
   * De quem é o dinheiro da lista — passado só quando a tela oferece as DUAS
   * óticas (gestor). Trocar a ótica refaz todos os números, e a frase que os
   * explica não pode continuar a mesma.
   *
   * Sem ele, a frase é a neutra: é o caso do vendedor, que não escolhe nada e
   * para quem "a comissão" é a dele, sem qualificativo.
   */
  audience?: CommissionAudience
): string => {
  const seller = audience === "seller";
  const quem =
    audience === undefined
      ? "há a receber"
      : seller
        ? "o vendedor tem a receber"
        : "as fábricas devem";
  switch (tab) {
    case "overdue":
      return `Mostrando os boletos travados de todos os vencimentos — esta aba não segue o mês; os cartões acima continuam somando ${monthName}`;
    case "receivable":
      return `Mostrando o que ${quem} em ${monthName}, já líquido de estorno`;
    case "pending":
      return `Mostrando o que está previsto para ${monthName}${seller ? " no ciclo do vendedor" : ""}`;
    case "received":
      return seller
        ? `Mostrando o que o escritório repassou ao vendedor em ${monthName}`
        : `Mostrando o que foi recebido em ${monthName}`;
    default:
      return `Mostrando tudo o que cai em ${monthName}, em qualquer situação`;
  }
};

export const MONTH_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      As setas trocam o mês; o botão do meio volta para o mês atual. O mês vale
      para os três cartões acima, para os cartões de cada fábrica e para o PDF.
    </Title>
    <Title variant="body-sm">
      O mês é o da data em que a comissão <Emphasis>cai</Emphasis> — não a do
      pedido. Um pedido faturado em junho, com prazo de 30 dias, aparece em
      julho.
    </Title>
    <Title variant="body-sm">
      Nesta tela, a data é a do repasse{" "}
      <Emphasis>da fábrica ao escritório</Emphasis>. No{" "}
      <Emphasis>extrato do vendedor</Emphasis> (uma das saídas do PDF) o mês é o
      do pagamento a ele, que costuma ser outro — a mesma parcela pode aparecer
      em meses diferentes nos dois papéis.
    </Title>
  </>
);

export const KPI_RECEIVABLE_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      Soma do que há a receber no mês escolhido, já descontados os estornos.
      Segue o mês e os filtros; <Emphasis>não muda com a aba</Emphasis> que você
      escolher abaixo.
    </Title>
    <Title variant="body-sm">
      Para quem gerencia, é o que a{" "}
      <Emphasis>fábrica paga ao escritório</Emphasis>. Quanto disso sai de
      repasse ao vendedor está na linha logo abaixo dos cartões.
    </Title>
  </>
);

export const KPI_PENDING_HELP: ReactNode = (
  <Title variant="body-sm">
    Soma do que ainda depende de faturamento ou do pagamento do cliente no mês
    escolhido. Segue o mês e os filtros; não muda com a aba.
  </Title>
);

export const KPI_RECEIVED_HELP: ReactNode = (
  <Title variant="body-sm">
    Soma do que a fábrica já repassou no mês escolhido. Segue o mês e os
    filtros; não muda com a aba.
  </Title>
);

export const FILTERS_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      Os filtros valem para a <Emphasis>tela inteira</Emphasis>: os cartões de
      cima, os cartões de cada fábrica e a lista de estornos do vendedor.
    </Title>
    <Title variant="body-sm">
      Com algum filtro ligado, aparece aqui do lado quantas parcelas passaram —
      assim um recorte esquecido não explica sozinho um total menor.
    </Title>
    <Title variant="body-sm">
      O filtro <Emphasis>Vendedor</Emphasis> só existe quando a tela está
      somando todos eles (ótica do escritório). Ele é diferente do seletor lá em
      cima: aqui é um <Emphasis>recorte de leitura</Emphasis> dentro da conta da
      casa — os cartões do mês passam a somar só o que sobrou —, enquanto o
      seletor de cima troca a pergunta para “quanto eu devo a esta pessoa”, no
      ciclo de pagamento dela.
    </Title>
  </>
);

export const PDF_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      São <Emphasis>dois papéis</Emphasis>, e o botão pergunta qual. O{" "}
      <Emphasis>fechamento do escritório</Emphasis> traz a comissão que as
      fábricas pagam — é o que se põe ao lado da planilha da fábrica, com os
      blocos por fábrica e a nota fiscal. O{" "}
      <Emphasis>extrato do vendedor</Emphasis> traz a fatia dele, no ciclo de
      pagamento dele — é o que se entrega ao vendedor. O papel diz, no
      cabeçalho, qual dos dois é.
    </Title>
    <Title variant="body-sm">
      Os valores <Emphasis>não coincidem</Emphasis>, e o mês também não: o
      extrato segue a data em que o escritório repassa ao vendedor, e os cartões
      desta tela seguem a data em que a fábrica paga o escritório.
    </Title>
    <Title variant="body-sm">
      Nos dois, o mês em cinco seções: o que há <Emphasis>a receber</Emphasis>,
      o que já foi <Emphasis>recebido</Emphasis> e o que está{" "}
      <Emphasis>previsto</Emphasis> — cada linha com a situação do boleto do
      cliente ao lado —, mais os <Emphasis>boletos liquidados</Emphasis> (pagos
      no mês) e os <Emphasis>inadimplentes</Emphasis>. As três primeiras seguem
      o mês escolhido. Os <Emphasis>inadimplentes</Emphasis>, não: calote fica
      travado até ser resolvido, e a fábrica manda o relatório dela com
      vencimentos de meses diferentes na mesma folha.
    </Title>
    <Title variant="body-sm">
      O papel <Emphasis>não segue a aba nem os filtros da tela</Emphasis>: ele é
      o fechamento do mês inteiro.
    </Title>
  </>
);

export const OFFICE_SPLIT_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      São dois acordos empilhados: a <Emphasis>fábrica</Emphasis> paga uma
      comissão ao escritório, e o <Emphasis>vendedor</Emphasis> tem a taxa dele
      sobre o pedido, que sai de dentro dessa comissão. A taxa é combinada por
      vendedor e por fábrica — o mesmo vendedor pode ganhar 3% numa e 2% em
      outra.
    </Title>
    <Title variant="body-sm">
      Os três números saem das <Emphasis>mesmas parcelas</Emphasis>: as que a
      fábrica paga neste mês. O repasse ao vendedor pode cair num mês diferente
      do dele; aqui ele aparece junto da comissão que o originou, senão a sobra
      não seria de ninguém.
    </Title>
  </>
);

export const AUDIENCE_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      A mesma parcela vale <Emphasis>dois números</Emphasis>: o que a fábrica
      paga ao escritório e a fatia que o escritório repassa ao vendedor. Este
      botão diz qual dos dois a tela inteira está mostrando — os cartões do mês,
      os cartões de cada fábrica e as colunas <Emphasis>Quando</Emphasis>,{" "}
      <Emphasis>Comissão</Emphasis> e <Emphasis>Situação</Emphasis>.
    </Title>
    <Title variant="body-sm">
      O <Emphasis>mês também muda</Emphasis>: o vendedor é pago no ciclo dele,
      então a mesma parcela pode aparecer em meses diferentes nas duas óticas.
    </Title>
    <Title variant="body-sm">
      A ótica muda também <Emphasis>de quem</Emphasis> são as parcelas.{" "}
      <Emphasis>Escritório</Emphasis> é a empresa inteira, com todos os
      vendedores somados — o seletor ao lado fica travado em “Todos os
      vendedores”. <Emphasis>Vendedor</Emphasis> destrava o seletor e a tela
      passa a mostrar um de cada vez.
    </Title>
    <Title variant="body-sm">
      As <Emphasis>ações continuam sendo do escritório</Emphasis> — conferir
      contra a planilha, registrar o que a fábrica pagou, repassar ao vendedor.
      Elas não mudam de significado com a ótica; só os números mudam.
    </Title>
  </>
);

export const SELLER_SELECT_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      Escolha de quem você quer ver as comissões. Ao trocar de vendedor o mês
      continua o mesmo, para comparar o mesmo fechamento entre eles.
    </Title>
    <Title variant="body-sm">
      Ele só vale na ótica do <Emphasis>vendedor</Emphasis>. Em{" "}
      <Emphasis>Escritório</Emphasis> a tela soma{" "}
      <Emphasis>todos os vendedores</Emphasis> — é a conta da casa, a que se
      confere contra a planilha da fábrica, que também vem com os pedidos de
      todos —, e por isso o campo fica travado em “Todos os vendedores”.
    </Title>
  </>
);

export const CHARGEBACK_PANEL_HELP: ReactNode = (
  <>
    <Title variant="body-sm">
      Comissão já repassada de boletos que o cliente acabou não pagando: o valor
      volta e é descontado do vendedor num fechamento.
    </Title>
    <Title variant="body-sm">
      <Emphasis>Esta lista não segue o mês nem a aba.</Emphasis> Um estorno sem
      mês definido não cairia em fechamento nenhum, e ele precisa aparecer antes
      de o dinheiro faltar.
    </Title>
  </>
);
