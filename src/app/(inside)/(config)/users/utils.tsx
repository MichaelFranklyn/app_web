import { ThemeColor } from "@/lib/theme";

export type UserRole = "OWNER" | "ADMIN" | "SELLER";

export const ROLE_COLOR: Record<UserRole, ThemeColor> = {
  OWNER: "amber",
  ADMIN: "blue",
  SELLER: "neutral",
};
