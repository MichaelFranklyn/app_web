import { getServerCookie } from "@/utils/cookies/serverCookie";
import { NextRequest, NextResponse } from "next/server";

import { upstreamTimeoutFor } from "./utils";

// BFF do GraphQL: as chamadas do CLIENTE passam por aqui (same-origin) em vez de
// irem direto ao backend. O token vive num cookie httpOnly (invisível ao JS) e é
// injetado no Authorization aqui no servidor — assim um XSS não consegue roubar a
// sessão. O SSR continua indo direto ao backend (getDataServer/gqlFetch), fora
// deste caminho.
const GQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_API_HOST || "";

// Limite da função na Vercel (s). Precisa cobrir o teto mais longo de
// `upstreamTimeoutFor`.
export const maxDuration = 300;

/**
 * "Não consegui chegar ao backend" — e não "o backend recusou".
 *
 * A diferença decide o destino de uma gravação feita sem sinal: 503/504 a fila
 * offline ESPERA e reenvia; qualquer outra coisa ela lê como recusa e descarta
 * (`isConnectivityError` em `services/offlineQueue/utils.ts`). Sem este
 * tratamento, a queda do backend virava exceção, a exceção virava 500, e a
 * visita registrada na loja era jogada fora como "recusada".
 */
function unreachable(status: 503 | 504, message: string) {
  return NextResponse.json(
    { errors: [{ message, extensions: { code: status } }] },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

/** Cookies da sessão que um 401 mata (os mesmos que o `DELETE /api/session` apaga). */
const SESSION_COOKIES = ["token", "userData", "remember"];

/**
 * O backend responde 200 com `extensions.code: 401` quando o token não vale
 * mais sem estar vencido — sessão revogada (troca de senha, saída em outro
 * aparelho), usuário desativado. O proxy só pega o `exp` no passado, então essa
 * sessão passava por ele e a tela ficava de pé, vazia, sem nunca voltar ao
 * login (painel em branco, 27/11/2026).
 */
function isSessionRejected(text: string): boolean {
  try {
    const json = JSON.parse(text) as {
      errors?: Array<{ extensions?: { code?: unknown } }>;
    };
    return Boolean(json.errors?.some((e) => e.extensions?.code === 401));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // token httpOnly (ou o `code` de primeiro acesso, como fazia o authLink).
  const token =
    (await getServerCookie<string>("token")) ??
    (await getServerCookie<string>("code"));

  const body = await req.text();

  // Preserva o `?op=<operationName>` que o gqlFetch/backend usa para observabilidade.
  let operationName: string | undefined;
  try {
    operationName = (JSON.parse(body) as { operationName?: string })
      .operationName;
  } catch {
    // corpo não-JSON: segue sem o hint de operação
  }
  const uri = operationName ? `${GQL_URI}?op=${operationName}` : GQL_URI;

  try {
    const upstream = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(upstreamTimeoutFor(operationName)),
    });

    // Ler o corpo também pode falhar (conexão cortada no meio da resposta).
    const text = await upstream.text();

    // Sessão recusada: vira 401 de verdade e os cookies saem aqui mesmo — o
    // cliente Apollo leva para o login, e o proxy, sem token, não deixa a
    // próxima navegação abrir uma tela que só daria erro.
    if (isSessionRejected(text)) {
      const response = new NextResponse(text, {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
      SESSION_COOKIES.forEach((name) => response.cookies.delete(name));
      return response;
    }

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError";
    return timedOut
      ? unreachable(504, "O servidor demorou demais para responder.")
      : unreachable(503, "Não foi possível falar com o servidor.");
  }
}
