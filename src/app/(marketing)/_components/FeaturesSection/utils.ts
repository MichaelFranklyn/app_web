import {
  BarChart3,
  ClipboardList,
  FileSpreadsheet,
  HandCoins,
  Route,
  Tags,
  Target,
  Users,
} from "lucide-react";
import { MarketingFeature } from "./interface";

/**
 * Os oito módulos, cada um com a cor que ele tem dentro do sistema
 * (`--mod-*`). Quem entra no teste depois de ler esta página encontra a mesma
 * cor na barra lateral — a página vira legenda do produto, não uma peça de
 * design separada dele.
 *
 * A ordem segue o caminho do dinheiro: primeiro o que faz vender (pedido,
 * carteira, rotina), depois o que faz receber e conferir.
 */
export const FEATURES: MarketingFeature[] = [
  {
    icon: ClipboardList,
    color: "var(--mod-orders)",
    title: "Pedidos e orçamentos",
    text: "Pedido em duas etapas, com o preço e o nível do cliente já preenchidos. Orçamento vira pedido sem redigitar, e o PDF sai pronto para mandar à fábrica.",
  },
  {
    icon: Users,
    color: "var(--mod-clients)",
    title: "Carteira de clientes",
    text: "Cada cliente com as fábricas que compra, rede e segmento, contatos, endereço e o histórico completo de pedidos.",
  },
  {
    icon: Route,
    color: "var(--mod-routine)",
    title: "Rotina e rota do dia",
    text: "O sistema monta a semana do vendedor, organiza a rota no mapa e registra o que saiu de cada visita.",
  },
  {
    icon: Tags,
    color: "var(--mod-products)",
    title: "Catálogo e tabelas de preço",
    text: "Tabela por região, níveis de desconto, ST com MVA, IPI e NCM por produto. O cálculo é do sistema, não da cabeça de quem digita.",
  },
  {
    icon: HandCoins,
    color: "var(--amber)",
    title: "Comissões",
    text: "A comissão nasce do que foi faturado, parcela a parcela, respeitando o dia de corte de cada fábrica. Dá para marcar recebimento e conciliar.",
  },
  {
    icon: FileSpreadsheet,
    color: "var(--mod-import)",
    title: "Importação em massa",
    text: "Clientes e tabelas de preço entram por planilha. Pedido da fábrica em PDF ou Excel vira pedido do sistema, item por item.",
  },
  {
    icon: BarChart3,
    color: "var(--mod-intel)",
    title: "Desempenho e relatórios",
    text: "Ranking de cliente, produto e vendedor, curva ABC e conferência de faturamento. Tudo exporta em XLSX e PDF.",
  },
  {
    icon: Target,
    color: "var(--mod-identity)",
    title: "Metas e avisos",
    text: "Meta por vendedor, fábrica e mês, com o realizado saindo dos pedidos. Os avisos chegam antes de o prazo virar problema.",
  },
];
