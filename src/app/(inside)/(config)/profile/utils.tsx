import { UserRole } from "./interface";

export const ROLE_LABEL: Record<UserRole, string> = {
  SU: "Super Admin",
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};

export const ROLE_COLOR: Record<UserRole, "amber" | "blue" | "neutral"> = {
  SU: "amber",
  OWNER: "amber",
  ADMIN: "blue",
  SELLER: "neutral",
};
