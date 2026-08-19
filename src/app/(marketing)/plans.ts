/**
 * Os planos como a vitrine os conta — cartões da home e comparativo de
 * `/precos`.
 *
 * Mora no pai do grupo porque tem dois consumidores (`_components/PlansSection`
 * e a página `/precos`). Uma cópia em cada lado envelheceria em ritmos
 * diferentes, e o comparativo passaria a prometer o que o cartão nega.
 *
 * ATENÇÃO — isto é uma CÓPIA da matriz que manda de verdade, em
 * `app_user/app/core/domain/plans.py` (`PLAN_CATALOG`). A landing é estática e
 * não fala com o backend: buscar o catálogo por GraphQL aqui custaria o cliente
 * do Apollo na primeira pintura da página pública, que é justamente o que o
 * grupo `(marketing)` evita. Mexeu nos tetos ou nos recursos de um plano lá,
 * mexa aqui — a tela de `/settings/plan`, essa sim, lê a fonte real.
 *
 * Os valores em `demoMonthlyPrice` são de DEMONSTRAÇÃO, para o fluxo de
 * assinatura simulado de `/assinar` ter o que exibir. Não são a tabela
 * comercial: trocar por preço real é uma decisão de negócio, e até lá a página
 * de checkout avisa em letra grande que nada é cobrado.
 */

// A duração do teste subiu para `@/utils/trial` quando a tela de login passou a
// anunciá-la também: o número é o mesmo nos dois grupos de rota, e duas cópias
// envelheceriam em ritmos diferentes. Reexportado aqui porque a vitrine inteira
// já o consome por este arquivo.
export { TRIAL_DAYS } from "@/utils/trial";

/** Um plano na vitrine. `code` é o mesmo do catálogo do backend — serve de
 * chave de lista e de rastro para quem for conferir a matriz. */
export interface MarketingPlan {
  code: string;
  label: string;
  pitch: string;
  limits: string;
  features: string[];
  /** Destaca o plano recomendado. Só um deve trazer. */
  isHighlighted?: boolean;
  /** Mensalidade de DEMONSTRAÇÃO, em reais. `null` no plano cujo valor é
   * fechado em conversa — ele não passa pelo checkout. */
  demoMonthlyPrice: number | null;
}

/** Quantos meses o ciclo anual cobra. Doze meses de uso por dez de conta é o
 * desconto mais comum do mercado, e o checkout simulado precisa de alguma
 * regra para exercitar a troca de ciclo. */
export const ANNUAL_BILLED_MONTHS = 10;

export const PLANS: MarketingPlan[] = [
  {
    code: "basic",
    label: "Básico",
    pitch: "Para quem quer tirar o pedido e a comissão da planilha.",
    limits: "Até 3 vendedores, 5 fábricas e 300 clientes.",
    demoMonthlyPrice: 249,
    features: [
      "Pedidos, orçamentos e faturamento",
      "Carteira de clientes e catálogo",
      "Tabelas de preço com ST, IPI e níveis",
      "Comissões apuradas por faturamento",
      "Avisos automáticos",
    ],
  },
  {
    code: "pro",
    label: "Pro",
    pitch: "O sistema inteiro, incluindo o motor de visita.",
    limits: "Até 15 vendedores, 30 fábricas e 3.000 clientes.",
    demoMonthlyPrice: 549,
    isHighlighted: true,
    features: [
      "Tudo do Básico",
      "Rotina de visitas e rota do dia",
      "Desempenho, rankings e relatórios",
      "Importação de planilha e de pedido em PDF",
      "Metas por vendedor, fábrica e mês",
    ],
  },
  {
    code: "enterprise",
    label: "Enterprise",
    pitch: "Para operações grandes, com contrato conversado.",
    limits: "Sem teto de vendedores, fábricas ou clientes.",
    demoMonthlyPrice: null,
    features: [
      "Tudo do Pro",
      "Volume ilimitado",
      "Condições combinadas caso a caso",
    ],
  },
];

/** Uma linha do comparativo. `true` vira marca de conferido, `false` vira
 * travessão e texto vira o número do teto — a tabela mistura os três tipos
 * porque volume e recurso respondem à mesma pergunta do leitor: "o que muda
 * quando eu subir de plano?". */
export interface PlanMatrixRow {
  label: string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export interface PlanMatrixGroup {
  title: string;
  rows: PlanMatrixRow[];
}

export const PLAN_MATRIX: PlanMatrixGroup[] = [
  {
    title: "Vender e receber",
    rows: [
      {
        label: "Pedidos, orçamentos e faturamento",
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        label: "Carteira de clientes por fábrica",
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        label: "Catálogo, tabelas de preço, ST e IPI",
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        label: "PDF do pedido e exportação em XLSX",
        basic: true,
        pro: true,
        enterprise: true,
      },
      {
        label: "Comissões, recebimento e conciliação",
        basic: true,
        pro: true,
        enterprise: true,
      },
      { label: "Avisos automáticos", basic: true, pro: true, enterprise: true },
    ],
  },
  {
    title: "Saber o que fazer amanhã",
    rows: [
      {
        label: "Rotina semanal e rota do dia no mapa",
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        label: "Prioridade de visita e registro de estoque",
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        label: "Desempenho, rankings e curva ABC",
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        label: "Relatórios de conferência",
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        label: "Importação de planilha e de pedido em PDF",
        basic: false,
        pro: true,
        enterprise: true,
      },
      {
        label: "Metas por vendedor, fábrica e mês",
        basic: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "Tamanho da operação",
    rows: [
      { label: "Vendedores", basic: "3", pro: "15", enterprise: "Sem teto" },
      {
        label: "Usuários com login",
        basic: "8",
        pro: "40",
        enterprise: "Sem teto",
      },
      {
        label: "Fábricas representadas",
        basic: "5",
        pro: "30",
        enterprise: "Sem teto",
      },
      {
        label: "Clientes na carteira",
        basic: "300",
        pro: "3.000",
        enterprise: "Sem teto",
      },
    ],
  },
];
