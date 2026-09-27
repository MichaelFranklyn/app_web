import { ClipboardList, Package, Users } from "lucide-react";
import { MigrationStep } from "./interface";

/**
 * A ordem importa: o histórico só casa com clientes que já estão na carteira e
 * com produtos que já estão no catálogo. Por isso os passos são numerados e o
 * histórico é o último.
 */
export const MIGRATION_STEPS: MigrationStep[] = [
  {
    number: 1,
    icon: Users,
    title: "Clientes",
    description:
      "Exporte a lista de clientes do sistema antigo e suba em Clientes → Importar. Basta a coluna do CNPJ: o resto vem da Receita.",
    href: "/clients",
    action: "Ir para Clientes",
  },
  {
    number: 2,
    icon: Package,
    title: "Produtos e preços",
    description:
      "Em cada fábrica, aba Tabelas → Importar tabela. Os produtos entram junto com os preços.",
    href: "/factories",
    action: "Ir para Fábricas",
  },
  {
    number: 3,
    icon: ClipboardList,
    title: "Histórico de pedidos",
    description:
      "Os pedidos antigos ensinam ao sistema o ritmo de compra de cada cliente. Com eles, a rotina e o estoque estimado já funcionam no primeiro dia.",
    href: "/settings/import/orders",
    action: "Importar histórico",
  },
];
