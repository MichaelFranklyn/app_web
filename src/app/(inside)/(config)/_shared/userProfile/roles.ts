import { ThemeColor } from "@/lib/theme";

// SU aparece quando o super usuário abre as telas pela empresa.
export type UserRole = "SU" | "OWNER" | "ADMIN" | "SELLER";

export const ROLE_COLOR: Record<UserRole, ThemeColor> = {
  SU: "purple",
  OWNER: "amber",
  ADMIN: "blue",
  SELLER: "neutral",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  SU: "Super Admin",
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};
