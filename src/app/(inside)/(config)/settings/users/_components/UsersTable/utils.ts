import { User } from "../../interface";
import { plural } from "@/utils/format/plural";

/**
 * Resumo de campo da pessoa ("Sudeste · 3 fábricas · 12 clientes"). Vazio para
 * quem não vende — a linha some em vez de mostrar zeros sem sentido.
 */
export const fieldSummary = (user: User): string => {
  const seller = user.seller;
  if (!seller) return "";

  return [
    seller.region,
    plural(seller.factoryCount, "fábrica", "fábricas"),
    plural(seller.clientCount, "cliente", "clientes"),
    seller.isActive ? null : "perfil de vendedor inativo",
  ]
    .filter(Boolean)
    .join(" · ");
};
