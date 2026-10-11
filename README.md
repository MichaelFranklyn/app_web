# Girus Web

Front do Girus: **Next.js 16 (App Router) + React 19 + TypeScript + Apollo Client 4**,
falando com a API GraphQL do `app_user`. É também um PWA instalável, com fila offline
limitada para o trabalho de campo.

---

## Rodando

Requisitos: Node 20+ e a API do `app_user` de pé (`http://localhost:8000`).

```bash
npm install
# crie o .env.local com as variáveis abaixo
npm run dev                  # http://localhost:3000
```

| Variável                          | Para quê                                                 |
| --------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_API_HOST`    | URL do `/graphql` do backend                             |
| `NEXT_PUBLIC_COOKIE_SECRET_KEY`   | ofuscação dos cookies legíveis pelo cliente (`userData`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | mapas da rota do dia (chave restrita por referrer)       |
| `NEXT_PUBLIC_SUPABASE_URL`        | origem das imagens (logos, fotos de produto)             |
| `NEXT_PUBLIC_SITE_URL`            | domínio público, para sitemap e Open Graph               |
| `NEXT_PUBLIC_DISABLE_SW`          | `1` desliga o service worker (usado no E2E)              |

Login de demonstração: ver `app_user` (`python -m app.seeds.seed_base`).

---

## Estrutura

```
src/
├── app/
│   ├── (marketing)/   landing, preços, termos — estático, sem Apollo
│   ├── (auth)/        login, cadastro, redefinição de senha
│   ├── (inside)/      o sistema: (operations) pedidos, clientes, fábricas, rotinas…
│   │                  e (config) configurações
│   ├── (platform)/    console da equipe da plataforma
│   ├── (portal)/      portal do cliente por link (/p/[token]), SSR puro
│   └── api/           BFF: /api/graphql e /api/session
├── components/        design system — toda tela é montada com estas peças
├── hooks/  services/  utils/  graphql/
├── __generated__/     snapshot do schema do backend (npm run schema:pull)
└── proxy.ts           gate de rotas (o `middleware` do Next 16)
```

Cada página segue o mesmo molde: `page.tsx` (servidor, nunca `"use client"`) +
`content.tsx` + `gql.ts` + `interface.ts` + `utils.ts` + `_components/`. Código usado
por dois ou mais componentes-irmãos sobe para o pai; um componente pode importar
um **componente** irmão para compô-lo.

---

## Sessão e segurança

O token mora num cookie **httpOnly**, invisível ao JavaScript. O navegador nunca
chama o backend direto: as operações do cliente passam por `/api/graphql` (BFF), que
injeta o `Authorization` no servidor. O SSR vai direto ao backend.

O BFF separa "o backend recusou" de "não consegui chegar ao backend": queda de
conexão vira **503** e estouro de tempo vira **504**, nunca 500. A fila offline
depende dessa diferença para decidir entre reenviar e descartar.

O que cada papel enxerga é decidido no servidor (`requireAdminPage`,
`requireFeaturePage`) e reforçado na API; esconder um botão na tela é só cortesia.

---

## Offline

`src/services/offlineQueue` guarda no aparelho **apenas** gravações que podem ser
repetidas sem estrago: resposta de visita e estoque da visita. Pedido não entra — sem
sinal ele fica como rascunho local na própria página.

- A entrada é identificada por **usuário + assunto**; outra pessoa no mesmo aparelho
  não envia nem sobrescreve o que não é dela.
- Uma descarga por vez no aparelho (Web Locks), mesmo com duas abas abertas.
- 408/429/502/503/504, falta de rede e sessão vencida fazem **esperar**; qualquer
  outra recusa tira o registro da fila e avisa a pessoa.

---

## Testes

```bash
npm test                 # vitest — utils, hooks e componentes
npm run coverage         # cobertura da camada de lógica
npm run e2e              # Playwright — telas, com a API simulada
npm run e2e:sw           # Playwright com o service worker LIGADO (offline de verdade)
npx tsc --noEmit         # tipos
npm run lint
```

**O que o E2E prova e o que não prova.** `npm run e2e` roda a interface de verdade
contra uma API **simulada** (mock por `operationName`, mais um stub para as consultas
do SSR) e com o service worker desligado. Garante que as telas funcionam; não
garante permissão, isolamento entre empresas nem regra de negócio — isso é do
backend, na suíte integrada (`app_user/scripts/run-integration-tests.sh`), com
banco e login reais.

`npm run e2e:sw` é a suíte do **PWA**: build próprio com o service worker ligado,
um spec por vez. Derruba a rede (inclusive a do service worker), registra uma
visita, fecha e reabre a aba, religa — e confere que o registro não some e chega
uma vez só, também com duas abas e com outra pessoa entrando no aparelho.
Qualquer ampliação do offline começa por um spec aqui.

O teste de contrato (`src/__generated__/schema-contract.test.ts`) confere cada documento GraphQL do front contra
o snapshot do schema; depois de mudar o backend, rode `npm run schema:pull`.

---

## Deploy

Vercel, a cada push na `main`. Front e backend têm ciclos independentes: se uma
tela pedir um campo que o backend em produção ainda não tem, o sintoma é carregamento
infinito só em produção — o backend precisa subir antes.
