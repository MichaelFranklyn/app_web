/**
 * Service worker do Girus.
 *
 * O que ele resolve: o vendedor trabalha DENTRO da loja, no celular, com sinal
 * ruim. Sem service worker, uma oscilação de rede na hora de abrir a rota do dia
 * entrega a tela de dinossauro do navegador — e a visita acontece sem o app.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O QUE ELE NÃO FAZ, e por quê
 * ─────────────────────────────────────────────────────────────────────────────
 * Ele NÃO guarda dados e NÃO enfileira mutations para enviar depois. Um pedido
 * escrito offline e sincronizado meia hora mais tarde teria de reconferir
 * preço, promoção, nível e piso de faturamento contra um catálogo que pode ter
 * mudado no meio — e resolver isso errado grava pedido com preço errado. Fila
 * offline é um projeto próprio, não um efeito colateral de um cache.
 *
 * O que ele faz é menor e seguro: o app ABRE offline (shell + assets), e o que
 * depende da rede mostra "sem conexão" em vez de erro do navegador.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REGRA DE SEGURANÇA QUE GOVERNA O ARQUIVO INTEIRO
 * ─────────────────────────────────────────────────────────────────────────────
 * NADA que dependa da sessão entra em cache. O app autentica por cookie httpOnly
 * e fala com o backend pelo BFF (`/api/graphql`); a resposta de uma query traz
 * dados de UM usuário e de UM tenant. Guardá-la no Cache Storage — que é por
 * origem, não por usuário — significa servir a carteira de um vendedor para o
 * próximo que entrar no mesmo aparelho. Por isso `/api/*` é sempre rede pura,
 * e mesmo a navegação só cai no cache para servir a PÁGINA OFFLINE, nunca uma
 * página de conteúdo gravada antes.
 */

// Trocar de versão descarta o cache antigo inteiro (ver `activate`). É o que
// impede um asset velho de sobreviver a um deploy.
const VERSION = "v1";
const SHELL_CACHE = `girus-shell-${VERSION}`;
const ASSET_CACHE = `girus-assets-${VERSION}`;

const OFFLINE_URL = "/offline";

// Só o indispensável para desenhar a página offline. Precache longo atrasa a
// ativação e, pior, um único 404 na lista faz `addAll` rejeitar e o SW nem
// instala.
const SHELL_ASSETS = [OFFLINE_URL, "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // `reload` para não gravar no shell uma resposta que já estava no cache
      // HTTP do navegador — em deploy novo isso guardaria a página offline
      // antiga.
      await cache.addAll(SHELL_ASSETS.map((url) => new Request(url, { cache: "reload" })));
      // Assume o controle sem esperar a próxima aba: o SW novo já traz a página
      // offline correta, e adiar isso deixa o aparelho com a antiga por dias.
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const manter = new Set([SHELL_CACHE, ASSET_CACHE]);
      const nomes = await caches.keys();
      await Promise.all(nomes.filter((n) => !manter.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

/** Assets imutáveis do Next: o nome carrega o hash do conteúdo. */
function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

/** Ícones e imagens da nossa origem — mudam raramente e não têm hash no nome. */
function isPublicImage(url) {
  return /\.(png|svg|ico|webp|jpg|jpeg|woff2?)$/i.test(url.pathname);
}

/**
 * Tudo que depende da sessão ou traz dado de usuário. Nunca cacheado.
 *
 * `_rsc` entra aqui junto com `/api/*`: a navegação client-side do App Router
 * busca o payload RSC da rota com esse parâmetro, e ele carrega dados já
 * renderizados do servidor — é conteúdo de sessão com outro nome.
 */
function isSessionScoped(url, request) {
  return (
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1"
  );
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  // Só 200 básico: opaque (cross-origin sem CORS) e erro não vão para o cache,
  // senão um 404 de asset fica gravado até a próxima versão do SW.
  if (response.ok && response.type === "basic") {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // GET só. POST/PATCH são mutations — passam direto, sempre.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Outra origem (Maps, Supabase Storage): deixa o navegador resolver. Cachear
  // aqui só duplicaria o cache HTTP e criaria respostas opacas inúteis.
  if (url.origin !== self.location.origin) return;

  if (isSessionScoped(url, request)) return;

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (isPublicImage(url)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // Navegação: rede primeiro, SEMPRE. O conteúdo das telas depende de sessão e
  // de dados que mudam (estoque, score, pedido), e servir uma versão gravada
  // seria mostrar o dia de ontem como se fosse hoje. O cache entra só quando a
  // rede falha, e apenas para dizer que falhou.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          const offline = await cache.match(OFFLINE_URL);
          return (
            offline ||
            new Response("Sem conexão.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })(),
    );
  }
});
