import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserData } from "./app/(auth)/login/interface";
import { getServerCookie } from "./utils/cookies/serverCookie";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/change-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getServerCookie<string>("token");
  const userData = await getServerCookie<UserData>("userData");

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!token || !userData) {
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
