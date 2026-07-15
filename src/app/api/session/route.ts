import { RESET_PASSWORD_MUTATION } from "@/app/(auth)/change-password/gql";
import { LOGIN_MUTATION } from "@/app/(auth)/login/gql";
import { REGISTER_COMPANY_MUTATION } from "@/app/(auth)/signup/gql";
import { gqlFetch } from "@/services/graphql/gqlFetch";
import {
  removeServerCookie,
  setServerCookie,
} from "@/utils/cookies/serverCookie";
import { DocumentNode } from "graphql";
import { NextRequest, NextResponse } from "next/server";

// Rota de sessão: estabelece/derruba a sessão gravando o token num cookie
// httpOnly (invisível ao JS). A mutation de auth roda AQUI no servidor — o token
// nunca transita pelo JS do navegador. O `userData` vai num cookie legível
// (não é segredo: só nome/empresa/papel, para a UI exibir).
type AuthPayload = {
  status: boolean;
  message: string;
  data:
    | ({
        accessToken: string;
        refreshToken?: string;
        userId?: string;
        userName: string;
        companyName: string;
        role: string;
      } & Record<string, unknown>)
    | null;
};

const MUTATIONS: Record<string, { doc: DocumentNode; field: string }> = {
  login: { doc: LOGIN_MUTATION, field: "login" },
  signup: { doc: REGISTER_COMPANY_MUTATION, field: "registerCompany" },
  changePassword: { doc: RESET_PASSWORD_MUTATION, field: "resetPassword" },
};

export async function POST(req: NextRequest) {
  const { action, input, remember } = (await req.json()) as {
    action?: string;
    input?: Record<string, unknown>;
    remember?: boolean;
  };

  const entry = action ? MUTATIONS[action] : undefined;
  if (!entry) {
    return NextResponse.json(
      { status: false, message: "Ação de sessão inválida." },
      { status: 400 }
    );
  }

  let payload: AuthPayload | undefined;
  try {
    // token=null → não anexa Authorization (essas mutations são públicas).
    const res = await gqlFetch<Record<string, AuthPayload>>(
      { query: entry.doc, variables: { input } },
      null
    );
    payload = res.data?.[entry.field];
  } catch (e) {
    return NextResponse.json(
      {
        status: false,
        message: e instanceof Error ? e.message : "Falha na autenticação.",
      },
      { status: 401 }
    );
  }

  if (!payload?.status || !payload.data) {
    return NextResponse.json(
      { status: false, message: payload?.message ?? "Falha na autenticação." },
      { status: 401 }
    );
  }

  const { accessToken, userId, userName, companyName, role } = payload.data;
  const sellerId = (payload.data.sellerId as string | null) ?? null;
  const userData = { userId, userName, companyName, role, sellerId };

  const secure = process.env.NODE_ENV === "production";
  const common = { sameSite: "lax" as const, secure };
  // Lembrar por 30 dias; senão, cai no default do setServerCookie (5 dias).
  const expires = remember ? { expires: 30 } : {};

  await setServerCookie("token", accessToken, {
    httpOnly: true,
    ...common,
    ...expires,
  });
  await setServerCookie("userData", userData, { ...common, ...expires });
  if (action === "login") {
    await setServerCookie("remember", String(!!remember), {
      ...common,
      ...expires,
    });
  }

  return NextResponse.json({ status: true, userData });
}

export async function DELETE() {
  await removeServerCookie("token");
  await removeServerCookie("userData");
  await removeServerCookie("remember");
  await removeServerCookie("code");
  return NextResponse.json({ status: true });
}
