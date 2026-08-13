import { RESET_PASSWORD_MUTATION } from "@/app/(auth)/change-password/gql";
import { LOGIN_MUTATION } from "@/app/(auth)/login/gql";
import { IMPERSONATE_USER_MUTATION } from "@/app/(platform)/platform/companies/[id]/gql";
import { REGISTER_COMPANY_MUTATION } from "@/app/(auth)/signup/gql";
import { gqlFetch } from "@/services/graphql/gqlFetch";
import {
  getServerCookie,
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

// Onde a sessão do SU fica guardada enquanto ele está personificando alguém.
// httpOnly como o `token`: é uma credencial completa de super usuário, e
// deixá-la ao alcance do JS da sessão emprestada seria entregar a chave junto.
const SU_TOKEN_COOKIE = "suToken";
const SU_USER_COOKIE = "suUserData";

const secureFlag = () => process.env.NODE_ENV === "production";
const cookieBase = () => ({ sameSite: "lax" as const, secure: secureFlag() });

export async function POST(req: NextRequest) {
  const { action, input, remember } = (await req.json()) as {
    action?: string;
    input?: Record<string, unknown>;
    remember?: boolean;
  };

  // Impersonação e sua saída não são autenticação: rodam COM o token da sessão
  // atual, devolvem outro formato e mexem em cookies extras. Ficam à parte para
  // não contaminar o caminho do login com condicionais.
  if (action === "impersonate") return startImpersonation(input);
  if (action === "stopImpersonation") return stopImpersonation();

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

  const common = cookieBase();
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

/**
 * Troca a sessão do SU pela de outro usuário, guardando a dele para a volta.
 *
 * A troca acontece no SERVIDOR porque o token emprestado é httpOnly: o cliente
 * não teria como gravá-lo. E a sessão do SU precisa ir para um cookie também
 * httpOnly — enquanto ele está "como" outra pessoa, a credencial de plataforma
 * não pode ficar legível pelo JS da tela em que ele está.
 */
async function startImpersonation(input?: Record<string, unknown>) {
  const suToken = await getServerCookie<string>("token");
  const suUserData = await getServerCookie<Record<string, unknown>>("userData");

  if (!suToken) {
    return NextResponse.json(
      { status: false, message: "Sessão expirada. Entre novamente." },
      { status: 401 }
    );
  }

  let payload: AuthPayload | undefined;
  try {
    const res = await gqlFetch<Record<string, AuthPayload>>(
      {
        query: IMPERSONATE_USER_MUTATION,
        variables: { userId: input?.userId, reason: input?.reason ?? null },
      },
      // COM o token do SU: a mutation é `@is_super_user`.
      suToken
    );
    payload = res.data?.impersonateUser;
  } catch (e) {
    return NextResponse.json(
      {
        status: false,
        message: e instanceof Error ? e.message : "Falha ao iniciar a sessão.",
      },
      { status: 400 }
    );
  }

  if (!payload?.status || !payload.data) {
    return NextResponse.json(
      {
        status: false,
        message: payload?.message ?? "Falha ao iniciar a sessão.",
      },
      { status: 400 }
    );
  }

  const { accessToken, userId, userName, companyName, role } = payload.data;
  const common = cookieBase();

  await setServerCookie(SU_TOKEN_COOKIE, suToken, {
    httpOnly: true,
    ...common,
  });
  if (suUserData) await setServerCookie(SU_USER_COOKIE, suUserData, common);

  await setServerCookie("token", accessToken, { httpOnly: true, ...common });
  await setServerCookie(
    "userData",
    {
      userId,
      userName,
      companyName,
      role,
      sellerId: (payload.data.sellerId as string | null) ?? null,
      // Marca que alimenta a faixa de aviso no topo do sistema. Guarda o NOME
      // do SU, não um booleano: a faixa precisa dizer quem está por trás.
      impersonatedBy: (suUserData?.userName as string) ?? "Suporte",
    },
    common
  );

  return NextResponse.json({ status: true });
}

/** Devolve a sessão do SU e descarta a emprestada. */
async function stopImpersonation() {
  const suToken = await getServerCookie<string>(SU_TOKEN_COOKIE);
  const suUserData =
    await getServerCookie<Record<string, unknown>>(SU_USER_COOKIE);

  if (!suToken || !suUserData) {
    // Sem a sessão guardada não há para onde voltar (cookie expirado, outro
    // navegador). Derrubar tudo é melhor que deixar a pessoa presa na conta
    // emprestada sem saber como sair.
    await DELETE();
    return NextResponse.json(
      {
        status: false,
        message: "Sessão do console expirada. Entre novamente.",
      },
      { status: 401 }
    );
  }

  const common = cookieBase();
  await setServerCookie("token", suToken, { httpOnly: true, ...common });
  await setServerCookie("userData", suUserData, common);
  await removeServerCookie(SU_TOKEN_COOKIE);
  await removeServerCookie(SU_USER_COOKIE);

  return NextResponse.json({ status: true });
}

export async function DELETE() {
  await removeServerCookie("token");
  await removeServerCookie("userData");
  await removeServerCookie("remember");
  await removeServerCookie("code");
  // A sessão guardada do SU sai junto: deixá-la para trás permitiria voltar ao
  // console depois de um logout explícito.
  await removeServerCookie(SU_TOKEN_COOKIE);
  await removeServerCookie(SU_USER_COOKIE);
  return NextResponse.json({ status: true });
}
