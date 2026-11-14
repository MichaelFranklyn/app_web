/**
 * Variante "linha-cartão" (`<Table.Table cards>`): abaixo de 1024px cada linha
 * vira um cartão, em vez de a tabela rolar para o lado.
 *
 * Por que existe: no tablet, a regra "célula em uma linha só e a tabela rola"
 * empurrava para fora da tela justamente a coluna que responde a pergunta — o
 * VALOR do pedido, o subtotal do item, a comissão. Quem vende no celular via o
 * nome do cliente e tinha de arrastar a lista para saber quanto era.
 *
 * Só CSS, com o mesmo `<table>`: nada de segunda árvore para o celular, que
 * cedo ou tarde ficaria com uma coluna a menos que a do desktop. No desktop
 * nenhuma destas classes vale (tudo é `max-desktop:`).
 *
 * O cartão é um grid de três colunas:
 *
 *   [lead] | title          | value
 *          | detalhe…       | status
 *          (com `amount`: "Valor: R$ x" e a status logo ao lado, na linha 2)
 *          | detalhe…       |
 *          | actions ……………………………
 *          | aside          | actions   (quando há `aside`: tarja + ações)
 *
 * Cada `Table.Cell` diz o seu lugar com `card` (ver `TableCardRole`). Célula
 * sem papel é DETALHE: desce na coluna do meio, uma por linha, com o rótulo
 * de `label` na frente ("Fábrica: Herc"), porque o cabeçalho some.
 *
 * Tudo é seletor a partir do wrapper (`[&_td[data-card=…]]`) e não classe na
 * célula: a célula não sabe se a tabela está em modo cartão, e assim não
 * precisa saber (nem virar componente de cliente para ler um contexto).
 */
export const tableCardsStyle = [
  // A tabela deixa de ser tabela.
  "max-desktop:[&>table]:block max-desktop:[&_tbody]:block",

  // O cabeçalho NÃO some: vira uma faixa de controles acima dos cartões. Antes
  // ele sumia inteiro, e com ele a ordenação e o "selecionar todos" — no
  // celular a lista ficava presa na ordem padrão e a baixa em lote só se fazia
  // marcando cartão por cartão. Os rótulos de coluna saem (cada célula já traz
  // o seu em `label`); ficam só os `th` que têm controle: o botão de ordenar
  // (vira chip) e o checkbox de seleção (vem primeiro; o texto ao lado é o
  // `label` do próprio checkbox, `desktop:hidden`, para o toque no texto marcar).
  "max-desktop:[&_thead]:block max-desktop:[&_thead_tr]:flex max-desktop:[&_thead_tr]:items-center",
  // UMA linha que rola para o lado: com flex-wrap, 10 chips de 44px viravam
  // cinco linhas de faixa antes do primeiro cartão (revisão 13/11/2026).
  "max-desktop:[&_thead_tr]:flex-nowrap max-desktop:[&_thead_tr]:overflow-x-auto",
  "max-desktop:[&_thead_th]:shrink-0 max-desktop:[&_thead_button]:whitespace-nowrap",
  "max-desktop:[&_thead_tr]:before:shrink-0 max-desktop:[&_thead_tr]:before:whitespace-nowrap",
  "max-desktop:[&_thead_tr]:gap-8 max-desktop:[&_thead_tr]:px-16 max-desktop:[&_thead_tr]:py-12",
  "max-desktop:[&_thead_tr]:border-b max-desktop:[&_thead_tr]:border-(--border) max-desktop:[&_thead_tr]:bg-(--bg2)",
  "max-desktop:[&_thead_th:not(:has(button)):not(:has(input))]:hidden",
  // Sem nada para ordenar nem selecionar, a faixa inteira sai: sobrava uma
  // tira vazia, com borda, entre o cabeçalho do card e o primeiro cartão.
  "max-desktop:[&_thead:not(:has(button,input))]:hidden",
  "max-desktop:[&_thead_th]:p-0 max-desktop:[&_thead_th]:border-0 max-desktop:[&_thead_th]:shadow-none max-desktop:[&_thead_th]:bg-transparent",
  // "Ordenar por:" só aparece quando há o que ordenar.
  "max-desktop:[&_thead_tr:has(button)]:before:content-['Ordenar_por:'] max-desktop:[&_thead_tr]:before:text-body-sm max-desktop:[&_thead_tr]:before:text-(--color-text-muted)",
  // Seleção: primeiro item da faixa, antes do "Ordenar por:".
  "max-desktop:[&_thead_th:has(input)]:order-first max-desktop:[&_thead_th:has(input)]:mr-8",
  "max-desktop:[&_thead_th:has(input)]:flex max-desktop:[&_thead_th:has(input)]:items-center max-desktop:[&_thead_th:has(input)]:gap-8",
  // Ordenar: chip com a mesma borda dos inputs; 32px, e 44px no toque — o
  // `before` que alargava o alvo no cabeçalho de tabela invadiria o chip
  // vizinho na faixa, então volta para dentro do botão.
  "max-desktop:[&_thead_button]:m-0 max-desktop:[&_thead_button]:min-h-32 max-desktop:[&_thead_button]:pointer-coarse:min-h-[44px]",
  "max-desktop:[&_thead_button]:px-10 max-desktop:[&_thead_button]:border max-desktop:[&_thead_button]:border-(--color-border-control) max-desktop:[&_thead_button]:rounded-full",
  "max-desktop:[&_thead_button]:normal-case max-desktop:[&_thead_button]:tracking-normal max-desktop:[&_thead_button]:text-body-sm max-desktop:[&_thead_button]:bg-(--bg)",
  "max-desktop:[&_thead_button]:before:inset-y-0",

  // A linha vira o cartão.
  "max-desktop:[&_tbody>tr]:grid max-desktop:[&_tbody>tr]:grid-cols-[auto_minmax(0,1fr)_auto]",
  "max-desktop:[&_tbody>tr]:items-center max-desktop:[&_tbody>tr]:gap-y-4",
  "max-desktop:[&_tbody>tr]:px-16 max-desktop:[&_tbody>tr]:py-12",
  "max-desktop:[&_tbody>tr]:border-b max-desktop:[&_tbody>tr]:border-(--border) max-desktop:[&_tbody>tr:last-child]:border-b-0",

  // Célula: sem caixa de tabela, e o texto QUEBRA — no cartão não há rolagem
  // para salvar um nome comprido.
  "max-desktop:[&_tbody_td]:block max-desktop:[&_tbody_td]:p-0 max-desktop:[&_tbody_td]:border-0",
  "max-desktop:[&_tbody_td]:whitespace-normal max-desktop:[&_tbody_td]:min-w-0",

  // Detalhe (célula sem papel): coluna do meio, texto menor, rótulo na frente.
  "max-desktop:[&_tbody_td]:text-left max-desktop:[&_tbody_td]:text-body-sm",
  "max-desktop:[&_td[data-label]]:before:mr-4 max-desktop:[&_td[data-label]]:before:text-(--color-text-muted)",
  "max-desktop:[&_td[data-label]]:before:content-[attr(data-label)_':']",
  // Conteúdo em <div> (o `Table.Cell flex`, avatar + nome) é bloco e descia
  // para baixo do rótulo, deixando "Vendedor:" sozinho numa linha.
  "max-desktop:[&_td[data-label]>div]:inline-flex max-desktop:[&_td[data-label]>div]:align-middle",
  // Idem o <p> do `<Title>` ("Comissão:" sozinho e o valor na linha de baixo).
  "max-desktop:[&_td[data-label]>p]:inline",

  // Identidade: primeira linha, no meio.
  "max-desktop:[&_td[data-card=title]]:[grid-column:2] max-desktop:[&_td[data-card=title]]:row-start-1 max-desktop:[&_td[data-card=title]]:text-[14px]",

  // Valor: primeira linha, à direita — sempre à vista, é a resposta da lista.
  "max-desktop:[&_td[data-card=value]]:[grid-column:3] max-desktop:[&_td[data-card=value]]:row-start-1",
  "max-desktop:[&_td[data-card=value]]:pl-12 max-desktop:[&_td[data-card=value]]:text-right max-desktop:[&_td[data-card=value]]:text-[14px]",

  // Sempre `grid-column` inteiro, nunca `col-start-*`: o longhand herdaria o
  // fim `-1` daqui e o título (ou a seleção) invadiria a coluna do valor.
  // Detalhe ocupa o meio E a direita: a coluna da direita tem a largura do
  // valor, e um detalhe preso ao meio quebrava em duas linhas ("Boleto: Vence
  // em…") com a direita vazia ao lado.
  "max-desktop:[&_tbody_td]:[grid-column:2/-1]",

  // Situação: linha própria, logo abaixo da identidade — uma informação por
  // linha. Ao lado do valor ela espremia o primeiro detalhe.
  "max-desktop:[&_td[data-card=status]]:[grid-column:2/-1] max-desktop:[&_td[data-card=status]]:row-start-2",
  "max-desktop:[&_td[data-card=status]]:justify-self-start",
  // Sem `value` nem `amount`, o canto do título está livre: a situação sobe
  // para lá. Sozinha na linha 2, a tag deixava o resto da linha vazio (regra
  // "nenhuma linha com sobra", 13/11/2026).
  "max-desktop:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:[grid-column:3]",
  "max-desktop:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:row-start-1",
  "max-desktop:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:pl-12",
  "max-desktop:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:justify-self-end",
  // No canto, a coluna da situação é `auto` e cresce com as tags. Duas tags
  // ("Ativo" + "Precisa de atenção") a 320px tomavam a linha inteira e o
  // título (minmax(0,1fr)) ficava com 0px — o nome do produto sumia do
  // cartão. Teto de metade do cartão, e as tags quebram linha dentro dele.
  "max-desktop:[&_tbody>tr:not(:has(td[data-card=value],td[data-card=amount]))]:grid-cols-[auto_minmax(0,1fr)_fit-content(50%)]",
  "max-desktop:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:whitespace-normal",
  "max-desktop:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]>div]:flex-wrap",
  "max-desktop:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]>div]:justify-end",

  // Amount: o valor na linha da situação, com o rótulo na frente e a tag
  // ENCOSTADA nele ("Valor: R$ 45,00 [A receber]"), em vez do canto do título.
  // O cartão ganha 4 colunas — lead | valor (largura dele) | resto | "…" —
  // para a tag começar onde o valor acaba. O título, o detalhe e o `aside`
  // atravessam valor+resto; o "…" ao lado do `aside` vai para a 4ª.
  "max-desktop:[&_tbody>tr:has(td[data-card=amount])]:grid-cols-[auto_auto_minmax(0,1fr)_auto]",
  "max-desktop:[&_tr:has(td[data-card=amount])_td[data-card=aside]]:[grid-column:2/4]",
  "max-desktop:[&_tr:has(td[data-card=amount]):has(td[data-card=aside])_td[data-card=actions]]:[grid-column:4]",
  "max-desktop:[&_td[data-card=amount]]:[grid-column:2] max-desktop:[&_td[data-card=amount]]:row-start-2",
  "max-desktop:[&_td[data-card=amount]]:text-left max-desktop:[&_td[data-card=amount]]:text-[14px]",
  // Flex: o número vem num <Title>, que é bloco e descia para baixo do rótulo.
  "max-desktop:[&_td[data-card=amount]]:flex max-desktop:[&_td[data-card=amount]]:flex-wrap max-desktop:[&_td[data-card=amount]]:items-baseline",
  "max-desktop:[&_tr:has(td[data-card=amount])_td[data-card=title]]:[grid-column:2/-1]",
  // Pela LINHA, não por `amount ~ status`: em /orders a situação vem antes do
  // valor (é a ordem das colunas no desktop) e ficava sozinha na linha de cima
  // em vez de encostar no "Valor: R$ x" (14/11/2026).
  "max-desktop:[&_tr:has(td[data-card=amount])_td[data-card=status]]:[grid-column:3] max-desktop:[&_tr:has(td[data-card=amount])_td[data-card=status]]:pl-8",
  // Ações: SEMPRE a última linha, ocupando o meio e a direita, alinhadas à
  // direita. Antes, com `amount`, o "…" subia para o canto do título; o pedido
  // de 14/11/2026 foi o contrário: as ações fecham o cartão, em toda tabela.
  "max-desktop:[&_td[data-card=actions]]:[grid-column:2/-1] max-desktop:[&_td[data-card=actions]]:pt-4",

  // Aside: detalhe com controle na coluna do meio da última linha, e o "…" de
  // `actions` ao lado, na direita — a linha das ações deixa de ter só o "…".
  "max-desktop:[&_td[data-card=aside]]:[grid-column:2] max-desktop:[&_td[data-card=aside]]:pt-4",
  "max-desktop:[&_td[data-card=aside]]:flex max-desktop:[&_td[data-card=aside]]:items-center",
  "max-desktop:[&_td[data-card=aside]]:flex-wrap max-desktop:[&_td[data-card=aside]]:gap-4",
  // Pela LINHA, não por adjacência (`aside+actions`): a tarja que vira aside
  // (situação, prioridade, prazo) costuma estar longe das ações no DOM. `order`
  // leva as duas para depois de TODOS os detalhes — é a linha que fecha o
  // cartão: "[Ativa] ………… [✎ 🗑]" (14/11/2026).
  "max-desktop:[&_tr:has(td[data-card=aside])_td[data-card=actions]]:[grid-column:3]",
  "max-desktop:[&_td[data-card=aside]]:order-1 max-desktop:[&_tr:has(td[data-card=aside])_td[data-card=actions]]:order-1",
  // Tarja sem ações na linha (reclamações: situação + urgência na MESMA
  // célula): ocupa meio + direita, alinhada à esquerda, em vez de deixar a
  // coluna das ações vazia (14/11/2026).
  "max-desktop:[&_tr:not(:has(td[data-card=actions]))_td[data-card=aside]]:[grid-column:2/-1]",

  // Seleção (checkbox): à esquerda, no alto do cartão.
  "max-desktop:[&_td[data-card=lead]]:[grid-column:1] max-desktop:[&_td[data-card=lead]]:row-start-1",
  "max-desktop:[&_td[data-card=lead]]:pr-12 max-desktop:[&_td[data-card=lead]]:self-start",

  // Detalhe com várias partes empilhadas (`flex flex-col`: "44 na última" /
  // "média 36"): no cartão vira UMA frase corrida depois do rótulo. Empilhado,
  // o rótulo ficava sozinho à esquerda e sobrava um vão branco embaixo dele
  // (pedido de 14/11/2026). As partes ganham um "·" entre si.
  "max-desktop:[&_td[data-label]>div.flex-col]:inline",
  "max-desktop:[&_td[data-label]>div.flex-col>*:not([data-badge])]:inline",
  "max-desktop:[&_td[data-label]>div.flex-col>*+*]:before:content-['·'] max-desktop:[&_td[data-label]>div.flex-col>*+*]:before:mx-4",

  // Celular: uma informação por linha, sem segunda coluna ao lado do título.
  // Com a tag ou o valor no canto, o título quebrava espremido na metade
  // esquerda e a direita ficava vazia embaixo do canto (14/11/2026). Abaixo
  // do tablet o título ocupa a linha toda e o canto desce para a linha dele.
  "max-tablet:[&_td[data-card=title]]:[grid-column:2/-1]",
  "max-tablet:[&_td[data-card=value]]:[grid-column:2/-1] max-tablet:[&_td[data-card=value]]:row-start-2",
  "max-tablet:[&_td[data-card=value]]:pl-0 max-tablet:[&_td[data-card=value]]:text-left",
  "max-tablet:[&_tr:has(td[data-card=value])_td[data-card=status]]:row-start-3",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:[grid-column:2/-1]",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:row-start-2",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:pl-0",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]]:justify-self-start",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount]))_td[data-card=status]>div]:justify-start",
  // Situação + ações (sem valor nem `aside`): a tag vai para a linha das
  // ações, à esquerda dos ícones. Sozinha na linha 2 ela deixava o resto da
  // linha vazio, e os ícones ficavam sozinhos na última (vínculos do cliente,
  // 14/11/2026). Sem linha fixa: o auto-placement põe a tag depois dos
  // detalhes e as ações (coluna 3, à direita dela) na mesma linha. `order`
  // empurra as duas para depois de TODOS os detalhes, mesmo os que vêm depois
  // da situação no DOM (agenda do cliente: Resultado e Motivo).
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount],td[data-card=aside])):has(td[data-card=actions])_td[data-card=status]]:order-1 max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount],td[data-card=aside])):has(td[data-card=actions])_td[data-card=actions]]:order-1",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount],td[data-card=aside])):has(td[data-card=actions])_td[data-card=status]]:[grid-column:2] max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount],td[data-card=aside])):has(td[data-card=actions])_td[data-card=status]]:[grid-row:auto]",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount],td[data-card=aside])):has(td[data-card=actions])_td[data-card=status]]:pt-4",
  "max-tablet:[&_tr:not(:has(td[data-card=value],td[data-card=amount],td[data-card=aside])):has(td[data-card=actions])_td[data-card=actions]]:[grid-column:3]",
  // Só título + ações (catálogos: rótulo, unidade, segmento): não há outra
  // linha para as ações dividirem, então o "⋯" sobe para o canto do título.
  // Na última linha ele ficava sozinho, com o cartão inteiro vazio à esquerda
  // (regra "nenhuma linha com sobra", 14/11/2026). Vale também no celular,
  // onde o título normalmente ocupa a linha toda.
  "max-desktop:[&_tr:not(:has(td:not([data-card=title],[data-card=actions],[data-card=lead],[data-card=hidden])))_td[data-card=title]]:[grid-column:2] max-tablet:[&_tr:not(:has(td:not([data-card=title],[data-card=actions],[data-card=lead],[data-card=hidden])))_td[data-card=title]]:[grid-column:2]",
  "max-desktop:[&_tr:not(:has(td:not([data-card=title],[data-card=actions],[data-card=lead],[data-card=hidden])))_td[data-card=actions]]:[grid-column:3] max-desktop:[&_tr:not(:has(td:not([data-card=title],[data-card=actions],[data-card=lead],[data-card=hidden])))_td[data-card=actions]]:row-start-1",
  "max-desktop:[&_tr:not(:has(td:not([data-card=title],[data-card=actions],[data-card=lead],[data-card=hidden])))_td[data-card=actions]]:pt-0 max-desktop:[&_tr:not(:has(td:not([data-card=title],[data-card=actions],[data-card=lead],[data-card=hidden])))_td[data-card=actions]]:self-center",
  // O que fica para o detalhe da entidade.
  "max-desktop:[&_td[data-card=hidden]]:hidden",

  // Linha de aviso (vazio, erro) ocupa o cartão inteiro.
  "max-desktop:[&_td[colspan]]:[grid-column:1/-1]",
].join(" ");
