import { NextRequest, NextResponse } from "next/server";
import { parseUnsubscribeKind, requestUnsubscribe } from "../utils";

/**
 * Descadastro de um clique (RFC 8058) — o endereço do cabeçalho
 * `List-Unsubscribe` dos resumos e dos avisos de pedido ao cliente (`kind`).
 *
 * O Gmail e o Yahoo mostram "Cancelar inscrição" ao lado do remetente e, no
 * clique, fazem um POST aqui com `List-Unsubscribe=One-Click` no corpo. Não há
 * página nem confirmação: a norma pede que o POST baste. Por isso só o POST
 * desliga — scanner de link abre GET, e GET aqui só leva para a página com o
 * botão, como o link do rodapé.
 *
 * Responde 200 mesmo quando o token não vale: quem chama é o provedor, não uma
 * pessoa, e um erro não teria a quem ser mostrado. O token adulterado já é
 * recusado pelo backend, sem efeito nenhum.
 */
export async function POST(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = params.get("token");
  if (token) {
    await requestUnsubscribe(
      parseUnsubscribeKind(params.get("kind")),
      token
    ).catch(() => null);
  }
  return new NextResponse(null, { status: 200 });
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = params.get("token") ?? "";
  const kind = params.get("kind");
  const target = new URL("/email/unsubscribe", request.url);
  if (kind) target.searchParams.set("kind", kind);
  if (token) target.searchParams.set("token", token);
  return NextResponse.redirect(target);
}
