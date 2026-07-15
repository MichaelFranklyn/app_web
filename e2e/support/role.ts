import { UserRole } from "@/app/(auth)/login/interface";
import { encryptKeyName, encryptValue } from "@/utils/cookies/helpersCookie";
import { Page } from "@playwright/test";
import { BASE_URL } from "../../playwright.config";

/**
 * Troca o PAPEL do usuário logado sobrescrevendo o cookie `userData` (ofuscado
 * com os mesmos helpers do app). O storageState padrão é um vendedor; specs de
 * ações admin (vincular fábrica, etc.) chamam grantRole(page, "OWNER") antes
 * do primeiro goto.
 *
 * Por padrão só muda a UI condicionada a papel — a autorização server-side vem
 * do JWT do storageState (role owner), que já passa nos guards. Com
 * `alsoJwt: true`, forja também o cookie `token` (httpOnly) com o papel pedido,
 * para exercitar os guards/redirects server-side (ex.: vendedor em /settings).
 */
export async function grantRole(
  page: Page,
  role: UserRole,
  opts: { alsoJwt?: boolean } = {}
) {
  const userData = {
    userId: "user-e2e-1",
    userName: "Vendedor Teste",
    companyName: "Empresa Teste",
    role,
    sellerId: null,
  };
  const cookies = [
    {
      name: encryptKeyName("userData"),
      value: encryptValue(JSON.stringify(userData)),
      url: BASE_URL,
    },
  ];

  if (opts.alsoJwt) {
    // Mesmo formato do FAKE_JWT (3 segmentos, sem validação de assinatura nos
    // mocks) — o backend emite o claim `role` em minúsculo.
    const payload = Buffer.from(
      JSON.stringify({ sub: "e2e-user", role: role.toLowerCase() })
    ).toString("base64url");
    const jwt = `eyJhbGciOiJIUzI1NiJ9.${payload}.e2e-signature`;
    cookies.push({
      name: encryptKeyName("token"),
      value: encryptValue(jwt),
      url: BASE_URL,
      httpOnly: true,
    } as (typeof cookies)[number]);
  }

  await page.context().addCookies(cookies);
}
