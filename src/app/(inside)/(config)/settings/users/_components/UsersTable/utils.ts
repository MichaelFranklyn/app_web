import { User } from "../../interface";

/**
 * Resumo de campo da pessoa ("Sudeste · 3 fábricas · 12 clientes"). Vazio para
 * quem não vende — a linha some em vez de mostrar zeros sem sentido.
 */
export const fieldSummary = (user: User): string => {
  const seller = user.seller;
  if (!seller) return "";

  const plural = (count: number, singular: string, many: string): string =>
    `${count} ${count === 1 ? singular : many}`;

  return [
    seller.region,
    plural(seller.factoryCount, "fábrica", "fábricas"),
    plural(seller.clientCount, "cliente", "clientes"),
    seller.isActive ? null : "perfil de vendedor inativo",
  ]
    .filter(Boolean)
    .join(" · ");
};
