import {
  ClipboardList,
  FileSpreadsheet,
  HandCoins,
  Lightbulb,
  Tags,
  Target,
  Users,
} from "lucide-react";
import { MarketingFeature } from "./interface";

/**
 * Os módulos, cada um com a cor que ele tem dentro do sistema (`--mod-*`).
 * Quem entra no teste depois de ler esta página encontra a mesma cor na barra
 * lateral — a página vira legenda do produto.
 *
 * Bento desde 19/11/2026: o pedido (2×2), a comissão e as oportunidades (2×1)
 * levam um recorte do print real; o resto é cartão simples. A rotina saiu
 * daqui porque tem seção própria logo acima. A ordem preenche a grade de
 * quatro colunas sem buraco — mudar a ordem exige conferir o desenho.
 */
export const FEATURES: MarketingFeature[] = [
  {
    icon: ClipboardList,
    color: "amber",
    title: "Pedidos e orçamentos",
    text: "Pedido com o preço e o nível do cliente já preenchidos. Orçamento vira pedido sem redigitar, e o PDF sai pronto para mandar à fábrica.",
    size: "big",
    shot: {
      src: "/marketing/pedidos.webp",
      alt: "Lista de pedidos do Itinus com os totais do mês.",
      zoom: 1.7,
      x: 5,
      y: 9,
    },
  },
  {
    icon: HandCoins,
    color: "amber",
    title: "Comissões",
    text: "A comissão nasce do que foi faturado, parcela a parcela, respeitando o dia de corte de cada fábrica.",
    size: "wide",
    shot: {
      src: "/marketing/comissoes.webp",
      alt: "Comissões do mês no Itinus: a receber, previsto e recebido.",
      zoom: 1.5,
      x: 6,
      y: 36,
    },
  },
  {
    icon: Tags,
    color: "purple",
    title: "Catálogo e tabelas",
    text: "Tabela por região, níveis de desconto, ST, IPI e NCM por produto. O cálculo é do sistema.",
  },
  {
    icon: Users,
    color: "green",
    title: "Carteira de clientes",
    text: "Cada cliente com as fábricas que compra, contatos, endereço e o histórico de pedidos.",
  },
  {
    icon: Lightbulb,
    color: "pink",
    title: "Oportunidades",
    text: "Quem está na hora de recomprar e quem ficou fora da rota, numa lista só — antes de o cliente esfriar.",
    size: "wide",
    shot: {
      src: "/marketing/oportunidades.webp",
      alt: "Oportunidades no Itinus: clientes no momento de recomprar.",
      zoom: 1.5,
      x: 6,
      y: 38,
    },
  },
  {
    icon: FileSpreadsheet,
    color: "orange",
    title: "Importação em massa",
    text: "Clientes e tabelas entram por planilha. Pedido da fábrica em PDF ou Excel vira pedido do sistema.",
  },
  {
    icon: Target,
    color: "blue",
    title: "Metas e relatórios",
    text: "Meta por vendedor e fábrica, ranking, curva ABC e conferência de faturamento, em XLSX e PDF.",
  },
];
