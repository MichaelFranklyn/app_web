import { getServerCookie } from "@/utils/cookies/serverCookie";
import { NextRequest, NextResponse } from "next/server";

// BFF do GraphQL: as chamadas do CLIENTE passam por aqui (same-origin) em vez de
// irem direto ao backend. O token vive num cookie httpOnly (invisível ao JS) e é
// injetado no Authorization aqui no servidor — assim um XSS não consegue roubar a
// sessão. O SSR continua indo direto ao backend (getDataServer/gqlFetch), fora
// deste caminho.
const GQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_API_HOST || "";

// Teto da chamada ao backend, abaixo do limite da função: sem ele a função
// morre pendurada e o navegador recebe um 500 genérico.
const UPSTREAM_TIMEOUT_MS = 25_000;

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
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    // Ler o corpo também pode falhar (conexão cortada no meio da resposta).
    const text = await upstream.text();
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
