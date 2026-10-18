import { isAdminRole, isOwnerRole } from "@/utils/auth/roles";
import {
  BadgeCheck,
  Building2,
  Import,
  LucideIcon,
  Tags,
  UserCog,
} from "lucide-react";

/** Quem vê a tela — espelha o guard da rota (`requireOwnerPage`/`requireAdminPage`). */
type SettingsAccess = "admin" | "owner";

export interface SettingsNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  access: SettingsAccess;
  /** Ativo também nas telas de dentro (ex.: o perfil em `/settings/users/[id]`). */
  matchPrefix?: string;
}

export interface SettingsNavGroup {
  label: string;
  links: SettingsNavLink[];
}

/**
 * As telas de Configurações, no menu interno da área (`layout.tsx`). A sidebar
 * tem um item só, "Configurações"; tela nova de configuração entra AQUI, no
 * grupo do assunto, e não na sidebar.
 */
export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    label: "Sua empresa",
    links: [
      {
        href: "/settings/company",
        label: "Empresa",
        icon: Building2,
        access: "owner",
      },
      {
        // Em todo plano: é onde se descobre por que um botão parou de funcionar.
        href: "/settings/plan",
        label: "Plano",
        icon: BadgeCheck,
        access: "owner",
      },
    ],
  },
  {
    label: "Equipe",
    links: [
      {
        href: "/settings/users",
        matchPrefix: "/settings/users",
        label: "Pessoas",
        icon: UserCog,
        access: "admin",
      },
    ],
  },
  {
    label: "Cadastros",
    links: [
      {
        href: "/settings/catalog",
        matchPrefix: "/settings/catalog",
        label: "Catálogos",
        icon: Tags,
        access: "admin",
      },
      {
        // A migração de quem chega de outro sistema.
        href: "/settings/import",
        matchPrefix: "/settings/import",
        label: "Trazer dados",
        icon: Import,
        access: "admin",
      },
    ],
  },
];

/**
 * Os grupos que o papel abre, sem os que ficaram vazios: o administrador não
 * vê "Sua empresa" (Empresa e Plano são do dono), e um título sem nada embaixo
 * é sujeira.
 */
export function visibleSettingsNav(role?: string | null): SettingsNavGroup[] {
  const can = (access: SettingsAccess) =>
    access === "owner" ? isOwnerRole(role) : isAdminRole(role);
  return SETTINGS_NAV.map((group) => ({
    ...group,
    links: group.links.filter((link) => can(link.access)),
  })).filter((group) => group.links.length > 0);
}
