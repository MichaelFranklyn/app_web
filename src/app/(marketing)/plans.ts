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
    pitch:
      "Para o representante sozinho: pedido, comissão e a rotina que diz quem visitar.",
    limits: "1 vendedor, 5 fábricas e 300 clientes.",
    demoMonthlyPrice: 50,
    features: [
      "Pedidos, orçamentos e faturamento",
      "Carteira de clientes e catálogo",
      "Tabelas de preço com ST, IPI e níveis",
      "Comissões apuradas por faturamento",
      "Rotina de visitas e rota do dia",
      "Relatórios e curva ABC",
    ],
  },
  {
    code: "intermediate",
    label: "Intermediário",
    pitch: "Para o escritório com equipe: metas e importação de planilha.",
    limits: "Até 3 vendedores, 10 fábricas e 1.000 clientes.",
    demoMonthlyPrice: 100,
    isHighlighted: true,
    features: [
      "Tudo do Básico",
      "Metas por vendedor, fábrica e mês",
      "Importação de planilha e de pedido em PDF",
    ],
  },
  {
    code: "corporate",
    label: "Corporativo",
    pitch: "O sistema inteiro, com a análise de desempenho da equipe.",
    limits: "Até 5 vendedores, 30 fábricas e 3.000 clientes.",
    demoMonthlyPrice: 200,
    features: [
      "Tudo do Intermediário",
      "Desempenho e rankings",
      "Cliente pede a reposição pelo portal",
      "Mais vendedores, fábricas e clientes",
    ],
  },
  {
    code: "enterprise",
    label: "Enterprise",
    pitch: "Para operações grandes, com contrato conversado.",
    limits: "Sem teto de vendedores, fábricas ou clientes.",
    demoMonthlyPrice: null,
    features: [
      "Tudo do Corporativo",
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
  intermediate: boolean | string;
  corporate: boolean | string;
  enterprise: boolean | string;
}

export interface PlanMatrixGroup {
  title: string;
  rows: PlanMatrixRow[];
}

/** Linha incluída em todos os planos. */
const everyPlan = (label: string): PlanMatrixRow => ({
  label,
  basic: true,
  intermediate: true,
  corporate: true,
  enterprise: true,
});

export const PLAN_MATRIX: PlanMatrixGroup[] = [
  {
    title: "Vender e receber",
    rows: [
      everyPlan("Pedidos, orçamentos e faturamento"),
      everyPlan("Carteira de clientes por fábrica"),
      everyPlan("Catálogo, tabelas de preço, ST e IPI"),
      everyPlan("PDF do pedido e exportação em XLSX"),
      everyPlan("Comissões, recebimento e conciliação"),
      everyPlan("Avisos automáticos"),
    ],
  },
  {
    title: "Saber o que fazer amanhã",
    rows: [
      everyPlan("Rotina semanal e rota do dia no mapa"),
      everyPlan("Prioridade de visita e registro de estoque"),
      everyPlan("Relatórios de conferência e curva ABC"),
      {
        label: "Metas por vendedor, fábrica e mês",
        basic: false,
        intermediate: true,
        corporate: true,
        enterprise: true,
      },
      {
        label: "Importação de planilha e de pedido em PDF",
        basic: false,
        intermediate: true,
        corporate: true,
        enterprise: true,
      },
      {
        label: "Desempenho e rankings",
        basic: false,
        intermediate: false,
        corporate: true,
        enterprise: true,
      },
      {
        label: "Cliente pede a reposição pelo portal",
        basic: false,
        intermediate: false,
        corporate: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "Tamanho da operação",
    rows: [
      {
        label: "Vendedores",
        basic: "1",
        intermediate: "3",
        corporate: "5",
        enterprise: "Sem teto",
      },
      {
        label: "Usuários com login",
        basic: "3",
        intermediate: "6",
        corporate: "10",
        enterprise: "Sem teto",
      },
      {
        label: "Fábricas representadas",
        basic: "5",
        intermediate: "10",
        corporate: "30",
        enterprise: "Sem teto",
      },
      {
        label: "Clientes na carteira",
        basic: "300",
        intermediate: "1.000",
        corporate: "3.000",
        enterprise: "Sem teto",
      },
    ],
  },
];
