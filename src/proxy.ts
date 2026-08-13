import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserData } from "./app/(auth)/login/interface";
import { parseJwtServer } from "./utils/auth/jwt";
import { isPlatformRole } from "./utils/auth/roles";
import { getServerCookie } from "./utils/cookies/serverCookie";

// Token com `exp` no passado → expirado. Sem `exp`, não bloqueia (deixa o
// backend decidir). Margem de 0s: o backend rejeita de qualquer forma.
function isTokenExpired(token: string): boolean {
  const exp = parseJwtServer(token)?.exp;
  return typeof exp === "number" && exp * 1000 <= Date.now();
}

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/change-password",
];

/** Raiz do console da plataforma. */
const PLATFORM_ROOT = "/platform";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getServerCookie<string>("token");
  const userData = await getServerCookie<UserData>("userData");

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Token ausente, sem userData ou já expirado → sessão inválida. Checar o `exp`
  // aqui evita bater no backend (BFF/SSR) com um token morto.
  const invalidSession = !token || !userData || isTokenExpired(token);

  if (invalidSession) {
    return isPublicRoute ? NextResponse.next() : forceLogout(request);
  }

  // O SU vive no console e só nele: o sistema do tenant é de owner/admin/
  // vendedor, e a empresa onde a conta dele está ancorada é um detalhe do
  // modelo (`users.company_id` é NOT NULL), não um lugar de trabalho. Sem este
  // desvio ele cairia no `/dashboard` de uma empresa qualquer ao entrar.
  //
  // Vale para login, raiz e URL digitada de uma vez só — daí estar aqui e não
  // no `onSuccess` do login. Não atrapalha a impersonação: naquele caso o token
  // é o do usuário personificado, e o papel lido aqui é o DELE.
  if (
    isPlatformRole(userData.role) &&
    !isPlatformRoute(pathname) &&
    !isPublicRoute
  ) {
    return NextResponse.redirect(new URL(PLATFORM_ROOT, request.url));
  }

  return NextResponse.next();
}

const isPlatformRoute = (pathname: string): boolean =>
  pathname === PLATFORM_ROOT || pathname.startsWith(`${PLATFORM_ROOT}/`);

function forceLogout(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const href = request.nextUrl.pathname + request.nextUrl.search;
  loginUrl.searchParams.set("href", href);

  const response = NextResponse.redirect(loginUrl);

  request.cookies.getAll().forEach((cookie) => {
    response.cookies.delete(cookie.name);
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|bmp|tiff|ttf|woff|woff2)$).*)",
  ],
};
