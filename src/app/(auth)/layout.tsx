import { AppProviders } from "@/components/AppProviders";

/**
 * Login, cadastro e recuperação de senha rodam mutations públicas (o
 * `registerCompany` do signup, entre outras), então precisam do Apollo e dos
 * toasts — que saíram do layout raiz para não pesar na landing.
 *
 * Grupo sem casca: cada tela desenha a própria moldura.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProviders>{children}</AppProviders>;
}
