/**
 * Endereço público do site e as rotas que os buscadores podem ver.
 *
 * Fonte única de propósito: o `sitemap.ts` anuncia esta lista e o `proxy.ts`
 * libera `PUBLIC_MARKETING_ROUTES`, que a contém. Separadas por completo, uma
 * página nova entraria no sitemap enquanto o proxy a mandava para o login — um
 * convite ao buscador para indexar a tela de login.
 */
export const MARKETING_ROUTES = ["/", "/precos", "/termos", "/privacidade"];

/**
 * Públicas, mas fora do sitemap: telas de meio de funil, que só fazem sentido
 * depois de uma escolha. `/assinar` é a de contratação — anunciá-la ao buscador
 * a colocaria na busca no lugar da página de preços.
 *
 * Cada uma delas precisa declarar `robots: { index: false }` no próprio
 * `metadata`; esta lista resolve só a passagem pelo proxy.
 */
export const UNLISTED_MARKETING_ROUTES = ["/assinar"];

/** O que o proxy libera sem sessão: as duas listas juntas. */
export const PUBLIC_MARKETING_ROUTES = [
  ...MARKETING_ROUTES,
  ...UNLISTED_MARKETING_ROUTES,
];

/**
 * Base absoluta usada em `metadataBase`, sitemap e robots. Buscadores e
 * pré-visualizações de link (WhatsApp, LinkedIn) exigem URL absoluta: relativa
 * nas tags OpenGraph vira imagem quebrada no card.
 *
 * Ordem: domínio próprio quando declarado (`NEXT_PUBLIC_SITE_URL`), senão o
 * domínio de produção que a Vercel injeta sozinha no build
 * (`VERCEL_PROJECT_PRODUCTION_URL` — sem esquema, daí o `https://`). O último
 * caso é o desenvolvimento local, onde nada disso existe.
 *
 * O fallback da Vercel é de propósito: enquanto o domínio final não estiver
 * apontado, o site ainda gera sitemap e OG válidos apontando para si mesmo, em
 * vez de para `localhost`.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
