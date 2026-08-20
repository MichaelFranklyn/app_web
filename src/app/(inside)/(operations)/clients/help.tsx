import { ReactNode } from "react";

/**
 * As explicações da carteira de clientes, num lugar só — lista e redes.
 *
 * A carteira é a tela onde mais se confunde CADASTRO com COMPORTAMENTO: "ativo"
 * é uma chave que alguém ligou na ficha, "atrasado" é uma conta sobre os
 * pedidos, e "sem visita" é a agenda. Os três parecem falar da mesma coisa e
 * não falam — cada texto abaixo responde uma pergunta que a tela levanta
 * sozinha.
 *
 * As colunas de tabela guardam STRING porque a explicação vai no `title` do
 * `<th>`: cabeçalho ordenável já é um `<button>`, e um botão de ajuda dentro
 * dele seria HTML inválido. O resto é ReactNode, para o HelpTooltip.
 *
 * Mesma organização de `orders/help.tsx`.
 */

// ── Cartões do topo ──────────────────────────────────────────────────────────

export const CLIENT_KPI_HELP: Record<string, ReactNode> = {
  "Total de clientes": (
    <>
      <p>
        Quantos clientes existem na sua carteira, <b>ativos ou não</b>. É o
        tamanho da carteira da empresa.
      </p>
      <p>
        Cliente excluído não entra. Escolhendo um vendedor no filtro, o cartão
        passa a contar só a carteira dele.
      </p>
    </>
  ),
  "Clientes ativos": (
    <>
      <p>
        Quantos estão marcados como <b>ativos na ficha</b> — a chave que se liga
        e desliga ao editar o cliente.
      </p>
      <p>
        É cadastro, não movimento: um cliente que parou de comprar continua
        contando aqui até alguém desmarcá-lo. Quem parou de comprar está no
        cartão ao lado.
      </p>
    </>
  ),
  "Atrasados para comprar": (
    <>
      <p>
        Clientes que passaram do <b>próprio ritmo</b> de compra: quem costuma
        comprar a cada 20 dias e sumiu há 60 está atrasado; quem compra a cada
        90 e sumiu há 60, não.
      </p>
      <p>
        Só entram os que já têm <b>dois pedidos ou mais</b> — sem um segundo
        pedido não existe ritmo para comparar. É a mesma conta do gráfico
        &quot;clientes em risco&quot; no Desempenho.
      </p>
    </>
  ),
  "Sem visita há 30d+": (
    <>
      <p>
        Clientes sem <b>nenhuma visita registrada</b> nos últimos 30 dias, em
        nenhuma das fábricas que você atende.
      </p>
      <p>
        Não é o mesmo que atrasado para comprar: dá para estar em dia com a
        compra e há tempos sem receber visita.
      </p>
    </>
  ),
};

// ── Colunas da lista ─────────────────────────────────────────────────────────

export const CLIENT_COLUMN_HELP = {
  client:
    "Razão social, nome fantasia e CNPJ do cliente. A tarja âmbar “Precisa de atenção” marca cadastro pendente de revisão — passe o mouse nela para ver o motivo. Ordena pela razão social.",
  city: "Cidade e estado do endereço cadastrado. É por ele que o cliente entra (ou não) na rota do dia: endereço que não vira coordenada some do mapa e ganha a tarja de atenção.",
  seller:
    "Vendedor que atende o cliente. O vínculo é por fábrica, então o mesmo cliente pode ter mais de um — o “+N” ao lado mostra os outros. Não ordena: não existe um vendedor por linha para comparar.",
  lastOrder:
    "Dia do pedido mais recente deste cliente, sem contar os cancelados. Não é a data da nota: essa fica na ficha do pedido. Cliente que nunca comprou vai para o fim da lista nas duas direções.",
  lastVisit:
    "Dia da visita mais recente, em qualquer das fábricas que você atende. Registro de visita nasce na rota do dia — cliente nunca visitado vai para o fim da lista.",
  score:
    "Quanto este cliente está precisando de visita: quanto MAIOR o número, mais urgente. É o maior score entre as fábricas do cliente, e sempre o mais recente de cada uma. Traço “—” significa que o motor ainda não calculou.",
} as const;

// ── Redes ────────────────────────────────────────────────────────────────────

export const NETWORK_HELP: ReactNode = (
  <>
    <p>
      Rede é o <b>grupo</b> a que várias lojas pertencem — a matriz e as filiais
      de um mesmo dono, com CNPJ diferente cada uma.
    </p>
    <p>
      Reunindo as lojas numa rede, você vê quanto o grupo inteiro comprou sem
      somar loja por loja, e pode filtrar a carteira por ela.
    </p>
  </>
);

export const NETWORK_COLUMN_HELP = {
  name: "Nome do grupo. Cada loja aponta para ele na própria ficha, no campo “Rede”. Ordena por nome.",
  stores:
    "Quantas lojas da sua carteira estão marcadas com esta rede. Loja sem rede marcada não aparece aqui.",
  invoiced:
    "Quanto as lojas desta rede já compraram somado — só o que a fábrica faturou (emitiu nota). Pedido em aberto ainda não entra.",
  lastOrder:
    "Dia do último pedido FATURADO entre as lojas da rede — a mesma régua da coluna ao lado. Traço “—” significa que nenhuma loja do grupo teve nota emitida ainda, mesmo que haja pedido em aberto.",
} as const;

/**
 * Colunas exclusivas da lista de lojas de uma rede. As demais (cidade,
 * vendedor, última compra) reusam `CLIENT_COLUMN_HELP`: é a mesma coluna da
 * carteira, e explicá-la duas vezes com palavras diferentes é como as duas
 * telas começam a divergir.
 */
export const STORE_COLUMN_HELP = {
  store:
    "Loja do grupo, como ela está cadastrada na sua carteira. Clique para abrir a ficha dela.",
  segment:
    "Ramo de atividade que a SUA empresa deu à loja (mercearia, padaria…). Não é o CNAE da Receita, que fica na ficha do cliente.",
} as const;

// ── Aba: fábricas do cliente ─────────────────────────────────────────────────

export const CLIENT_FACTORY_COLUMN_HELP = {
  factory:
    "Fábrica que este cliente compra. Cada linha é um vínculo — é ele que decide o nível de preço do cliente naquela fábrica e o que entra na rota de visita.",
  seller:
    "Vendedor que atende o cliente NESTA fábrica. Pode ser um em cada fábrica: por isso a lista de clientes mostra “+N” na coluna Vendedor.",
  priority:
    "Peso que este cliente tem na rota desta fábrica. Prioridade alta puxa o cliente para cima no score de visita.",
  frequency:
    "De quantos em quantos dias este cliente costuma comprar desta fábrica, e de onde esse número saiu (o que foi declarado ou o que os pedidos mostram). O triângulo âmbar aparece quando os dois discordam — passe o mouse nele para ver os dois números.",
  lastVisit:
    "Dia da visita mais recente registrada para este vínculo. Registro de visita nasce na rota do dia.",
  status: "Se o vínculo está valendo. Vínculo desfeito some da lista.",
  actions:
    "Trocar o nível, a prioridade e a frequência, ou desfazer o vínculo.",
} as const;

// ── Aba: visitas ─────────────────────────────────────────────────────────────

export const CLIENT_VISIT_COLUMN_HELP = {
  date: "Dia agendado da visita — e, quando não houve agenda, o momento em que ela foi registrada. A tarja abaixo diz se foi presencial ou remota.",
  focus:
    "Por que o sistema mandou visitar: as fábricas com score alto naquele dia. É a recomendação, não o que aconteceu.",
  treated:
    "O que o vendedor de fato tratou, deduzido das observações de estoque que ele registrou. Pode incluir fábrica fora do foco — ele está na loja e aproveita.",
  seller: "Vendedor dono da rota daquele dia.",
  status:
    "Se a visita está pendente, foi concluída ou não aconteceu. Visita vencida sem resposta é perguntada no dia seguinte.",
  outcome:
    "O que saiu da visita: vendeu, não comprou, remarcou. É o que alimenta o acerto do motor de rotina.",
  outcomeReason: "O que o vendedor escreveu para explicar o resultado.",
  actions:
    "Registrar o estoque observado na visita, corrigir o resultado ou excluir o registro.",
} as const;

// ── Aba: pedidos (modal de uma fábrica) ──────────────────────────────────────

export const CLIENT_ORDER_COLUMN_HELP = {
  code: "Código curto do pedido. Clique para abrir o pedido completo.",
  seller: "Vendedor que lançou o pedido — quem ganha a comissão dele.",
  date: "Dia em que a compra foi feita. Não é a data da nota.",
  amount:
    "Valor da mercadoria, sem IPI e sem imposto embutido — a base da comissão.",
  status:
    "Onde o pedido está: Orçamento, Confirmado, Faturado, Entregue ou Cancelado.",
  actions: "Editar as observações do pedido ou excluí-lo.",
} as const;
