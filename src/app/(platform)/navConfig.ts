import {
  Activity,
  BadgeCheck,
  Building2,
  History,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  UserCog,
} from "lucide-react";

/**
 * Menu do console da plataforma — separado do `NAV` de `(inside)` de propósito.
 *
 * Os dois nunca convivem: quem está no console está acima de qualquer empresa,
 * e misturar "Pedidos" com "Empresas da plataforma" na mesma lista convidaria
 * o SU a confundir o tenant onde a conta dele mora com a plataforma inteira.
 *
 * Um único item tem `suOnly`: a Equipe. Todo o resto do console é comum aos dois
 * papéis de plataforma — o suporte suspende empresa, troca plano e entra como
 * usuário; ele só não decide quem entra e quem sai da equipe.
 */
export const PLATFORM_NAV = [
  {
    href: "/platform",
    label: "Visão geral",
    icon: LayoutDashboard,
  },
  { divider: true },
  { section: "Plataforma" },
  {
    href: "/platform/companies",
    matchPrefix: "/platform/companies",
    label: "Empresas",
    icon: Building2,
  },
  {
    href: "/platform/users",
    matchPrefix: "/platform/users",
    label: "Pessoas",
    icon: UserCog,
  },
  {
    // Referência, não governança: aqui só se LÊ o que cada plano entrega. A
    // troca do plano de uma empresa continua na ficha dela, junto do histórico
    // e da auditoria daquela conta — que é o contexto de quem decide trocar.
    href: "/platform/plans",
    label: "Planos",
    icon: BadgeCheck,
  },
  { divider: true },
  { section: "Operação" },
  {
    href: "/platform/activity",
    label: "Histórico",
    icon: History,
  },
  {
    href: "/platform/audit",
    label: "Auditoria",
    icon: ScrollText,
  },
  {
    href: "/platform/health",
    label: "Saúde",
    icon: Activity,
  },
  { divider: true, suOnly: true },
  { section: "Governança", suOnly: true },
  {
    href: "/platform/team",
    matchPrefix: "/platform/team",
    label: "Equipe",
    icon: ShieldCheck,
    // Só o SU. O suporte não precisa da lista para trabalhar, e escondê-la
    // evita entregar o mapa pronto de quem tem acesso total à plataforma. O
    // gate de verdade é o `requireSuPage` da página e o `@is_super_user` do
    // backend — aqui é para não mostrar uma porta que não abre.
    suOnly: true,
  },
];

/**
 * O item da sidebar do sistema que leva ao console. Fica no `(inside)` para o
 * SU ter como sair do tenant; a volta é o botão "Sair do console" no topo do
 * `/platform`.
 */
export const PLATFORM_ENTRY_HREF = "/platform";
