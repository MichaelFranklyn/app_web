import { ReactNode } from "react";

/**
 * As explicações da tela de pessoas, num lugar só — lista e acessos.
 *
 * Aqui moram duas ideias que a tela funde de propósito e que por isso precisam
 * ser separadas em palavras: **login** (quem entra no sistema) e **perfil de
 * campo** (quem vende). A mesma pessoa costuma ser as duas coisas, mas não
 * necessariamente — e desligar uma não desliga a outra.
 *
 * As colunas de tabela guardam STRING porque a explicação vai no `title` do
 * `<th>`: cabeçalho ordenável já é um `<button>`, e um botão de ajuda dentro
 * dele seria HTML inválido. O resto é ReactNode, para o HelpTooltip.
 *
 * Mesma organização de `orders/help.tsx`, `clients/help.tsx` e
 * `factories/help.tsx`.
 */

// ── Cartões do topo ──────────────────────────────────────────────────────────

export const USERS_KPI_HELP: Record<string, ReactNode> = {
  "Vendem em campo": (
    <>
      <p>
        Quantas pessoas têm <b>perfil de vendedor ativo</b> — as que aparecem na
        rota do dia, recebem carteira e ganham comissão.
      </p>
      <p>
        Não é o mesmo que ter login: um gestor entra no sistema sem vender, e um
        vendedor afastado continua com login enquanto o perfil de campo está
        desligado.
      </p>
    </>
  ),
  "Acessos a fábricas": (
    <>
      <p>
        Quantas permissões de <b>vendedor × fábrica</b> estão ativas na empresa.
        Cada linha da aba ao lado conta uma.
      </p>
      <p>
        Um vendedor que atende três fábricas conta três — por isso este número é
        normalmente maior que o de pessoas.
      </p>
    </>
  ),
  "Acessos suspensos": (
    <p>
      Permissões que existem mas estão desligadas. O vendedor não vê aquela
      fábrica nem lança pedido dela, mas o histórico e os vínculos com clientes
      continuam de pé — religar devolve tudo.
    </p>
  ),
};

/**
 * O que os três cartões NÃO seguem.
 *
 * Eles vêm de uma consulta própria (`sellersStats`), que mede a empresa inteira
 * e não conhece a busca da lista. Quem procura por um nome e vê os cartões
 * parados conclui que a tela travou.
 */
export const KPI_IGNORES_SEARCH =
  "Os cartões acima contam a empresa inteira — a busca abaixo não os altera.";

// ── Colunas: pessoas ─────────────────────────────────────────────────────────

export const USER_COLUMN_HELP = {
  person:
    "Nome, e-mail e telefone de quem entra no sistema, com a data em que entrou. A linha de baixo, quando existe, resume a operação de campo da pessoa (fábricas e clientes que ela atende). Clique na linha para abrir o perfil completo.",
  badges:
    "À direita: se o login está ativo, o perfil de acesso (o que a pessoa pode fazer no sistema) e a tarja “Vende em campo”, que aparece só para quem tem perfil de vendedor. Login ativo e perfil de campo são coisas separadas — dá para ter um sem o outro.",
} as const;

// ── Colunas: acessos por fábrica ─────────────────────────────────────────────

export const ACCESS_HELP: ReactNode = (
  <>
    <p>
      Quem pode vender cada fábrica. É a mesma permissão da aba
      &quot;Vendedores&quot; dentro da fábrica, vista pelo outro lado: aqui a
      empresa inteira de uma vez.
    </p>
    <p>
      Sem acesso, o vendedor não vê a fábrica na lista dele, não lança pedido e
      não vincula cliente a ela.
    </p>
  </>
);

export const ACCESS_COLUMN_HELP = {
  seller:
    "Vendedor que recebeu a permissão. Use o filtro acima para ver tudo de uma pessoa — a coluna não ordena porque o nome vem de outra tabela.",
  factory:
    "Fábrica que ele pode vender. O nome mostrado é o apelido que a sua empresa deu a ela, quando existe.",
  grantedBy: "Quem concedeu o acesso — fica registrado para conferência.",
  commission:
    "Quanto DESTE vendedor sai da comissão da fábrica, quando o acordo dele é diferente do padrão da empresa. Vazio significa que vale o padrão.",
  date: "Quando o acesso foi concedido.",
  status:
    "Se a permissão está valendo. Suspender tira a fábrica da vista do vendedor sem apagar nada do que já foi feito.",
  actions: "Ajustar a comissão do vendedor, suspender ou remover o acesso.",
} as const;
