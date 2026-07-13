import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserData } from "./app/(auth)/login/interface";
import { parseJwtServer } from "./utils/auth/jwt";
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

  return NextResponse.next();
}

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
