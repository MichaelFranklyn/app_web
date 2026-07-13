import { getServerCookie } from "@/utils/cookies/serverCookie";
import { NextRequest, NextResponse } from "next/server";

// BFF do GraphQL: as chamadas do CLIENTE passam por aqui (same-origin) em vez de
// irem direto ao backend. O token vive num cookie httpOnly (invisível ao JS) e é
// injetado no Authorization aqui no servidor — assim um XSS não consegue roubar a
// sessão. O SSR continua indo direto ao backend (getDataServer/gqlFetch), fora
// deste caminho.
const GQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_API_HOST || "";

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

  const upstream = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
