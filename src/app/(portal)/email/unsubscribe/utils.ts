import { tokenFetch } from "@/services/graphql/tokenFetch";
import { DocumentNode } from "graphql";
import {
  UNSUBSCRIBE_CLIENT_ORDER_EMAILS,
  UNSUBSCRIBE_EMAIL_DIGEST,
} from "./gql";

/**
 * Quem está se descadastrando, pelo `kind` do link:
 * - `digest` (padrão): o usuário do Itinus, dos resumos e lembretes;
 * - `client`: o contato do cliente, dos avisos de pedido. Ele não tem conta —
 *   não há "Meu perfil" para indicar, só o representante.
 */
export type UnsubscribeKind = "digest" | "client";

export function parseUnsubscribeKind(raw?: string | null): UnsubscribeKind {
  return raw === "client" ? "client" : "digest";
}

export interface UnsubscribeCopy {
  title: string;
  subtitle: string;
  whatStops: string;
  whatKeeps: string;
  afterSuccess: string | null;
  invalidLink: string;
}

export const UNSUBSCRIBE_COPY: Record<UnsubscribeKind, UnsubscribeCopy> = {
  digest: {
    title: "Emails do Itinus",
    subtitle: "Parar de receber os resumos e lembretes",
    whatStops:
      "Você vai deixar de receber o resumo da semana, as pendências e os parabéns de aniversário e datas comemorativas.",
    whatKeeps:
      "Os emails de acesso à conta (convite, troca de senha e conta bloqueada) continuam chegando.",
    afterSuccess:
      "Mudou de ideia? Entre no Itinus e ligue de novo em Meu perfil → Emails do Itinus.",
    invalidLink:
      "Este link não é válido. Para parar de receber os emails, entre no Itinus e desligue a opção em Meu perfil.",
  },
  client: {
    title: "Avisos de pedido",
    subtitle: "Parar de receber os avisos de pedido por email",
    whatStops:
      "Você vai deixar de receber, neste email, o aviso de que o seu pedido foi confirmado.",
    whatKeeps:
      "Os seus pedidos continuam normalmente — só o aviso por email deixa de chegar.",
    afterSuccess: null,
    invalidLink:
      "Este link não é válido. Para parar de receber os emails, peça ao seu representante.",
  },
};

const MUTATIONS: Record<
  UnsubscribeKind,
  { document: DocumentNode; field: string }
> = {
  digest: {
    document: UNSUBSCRIBE_EMAIL_DIGEST,
    field: "unsubscribeEmailDigest",
  },
  client: {
    document: UNSUBSCRIBE_CLIENT_ORDER_EMAILS,
    field: "unsubscribeClientOrderEmails",
  },
};

type UnsubscribeResult = { status: boolean; message: string } | null;

/** Chama a mutation do `kind`. Só no servidor: o token não vai ao bundle. */
export async function requestUnsubscribe(
  kind: UnsubscribeKind,
  token: string
): Promise<UnsubscribeResult> {
  const { document, field } = MUTATIONS[kind];
  const data = await tokenFetch<Record<string, UnsubscribeResult>>(
    document,
    null,
    {
      token,
    }
  );
  return data?.[field] ?? null;
}
