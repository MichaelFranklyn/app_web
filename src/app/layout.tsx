import { ToastProvider } from "@/components/Toast/Provider";
import { GraphqlProvider } from "@/services/graphql/provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Nunito, Oswald } from "next/font/google";
import { Suspense } from "react";
import "../styles/globals.css";

/**
 * Fontes auto-hospedadas pelo Next: as regras `@font-face` entram no CSS do app
 * e os `.woff2` saem da nossa origem, já com `<link rel="preload">`.
 *
 * Antes vinham de um `@import` para fonts.googleapis.com dentro do
 * `globals.css` — uma requisição que bloqueia a pintura e que o navegador só
 * descobre DEPOIS de baixar o nosso CSS. Medido em produção: ela começava em
 * 120ms (quando o CSS do app terminava) e só liberava em 229ms, para um FCP de
 * 264ms. Aqui não há requisição extra nem dois hosts novos para resolver.
 *
 * Sem `weight`: as duas são variáveis no Google Fonts, então um arquivo cobre
 * toda a faixa de pesos que o tema usa (até 800 em `--weight-extrabold`).
 */
const fontHead = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-head-family",
});

const fontBody = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-family",
});

export const metadata: Metadata = {
  title: "Girus - Plataforma de Gestão Comercial",
  description:
    "Girus é uma plataforma de gestão comercial projetada para otimizar as operações de vendas, marketing e atendimento ao cliente. Com uma interface intuitiva e recursos avançados, o Girus ajuda as empresas a aumentar a eficiência, melhorar o relacionamento com os clientes e impulsionar o crescimento dos negócios.",
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      data-scroll-behavior="smooth"
      className={`${fontHead.variable} ${fontBody.variable}`}
    >
      <body suppressHydrationWarning className={`antialiased`}>
        <GraphqlProvider>
          <ToastProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </ToastProvider>
        </GraphqlProvider>
        {/* Web Vitals reais dos usuários e contagem de visitas/páginas. Os dois
            saem por /_vercel/* (mesma origem), então a CSP de produção já os
            cobre em `script-src 'self'` e `connect-src 'self'`. Só coletam
            quando servido pela Vercel — em dev e no E2E ficam inertes. */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
