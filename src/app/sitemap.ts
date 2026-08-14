import { getSiteUrl, MARKETING_ROUTES } from "@/utils/site";
import type { MetadataRoute } from "next";

/**
 * Só as páginas de marketing entram. O resto do app exige sessão — anunciar
 * `/dashboard` no sitemap seria mandar o buscador para um 307 rumo ao login.
 *
 * A lista vem de `MARKETING_ROUTES`, a mesma que o `proxy.ts` usa para liberar
 * essas rotas: uma página pública nova aparece aqui no mesmo commit em que
 * passa a ser acessível.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return MARKETING_ROUTES.map((route) => ({
    url: `${base}${route === "/" ? "" : route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));
}
