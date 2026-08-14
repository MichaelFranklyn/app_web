import { getSiteUrl } from "@/utils/site";
import type { MetadataRoute } from "next";

/**
 * Áreas privadas do sistema. Um robô anônimo já leva 307 para o login no
 * `proxy.ts`, então isto não é o que protege os dados — é o que evita gastar
 * orçamento de rastreio e, sobretudo, evita que a tela de login apareça na
 * busca no lugar da landing.
 *
 * As telas de `(auth)` ficam de fora da lista de propósito: `/login` e
 * `/signup` são páginas públicas legítimas, e bloquear o rastreio delas não
 * traria ganho. Elas só não entram no sitemap.
 */
const PRIVATE_AREAS = [
  "/api/",
  "/dashboard",
  "/platform",
  "/settings",
  "/orders",
  "/clients",
  "/factories",
  "/sellers",
  "/users",
  "/commissions",
  "/routines",
  "/goals",
  "/profile",
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_AREAS,
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
