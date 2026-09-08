import { ServiceWorker } from "@/components/ServiceWorker";
import { getSiteUrl } from "@/utils/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
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

/**
 * `metadataBase` é o que transforma os caminhos relativos das tags OpenGraph em
 * URLs absolutas — sem ele o Next avisa no build e o card de link sai sem
 * imagem no WhatsApp e no LinkedIn.
 *
 * A descrição encurtou (a anterior tinha ~380 caracteres): buscador e
 * pré-visualização cortam por volta de 160, então o que passa disso não é lido
 * por ninguém — só empurra a frase útil para fora.
 */
const description =
  "Pedidos, carteira de clientes, comissões e a rota do dia do vendedor: o comercial da sua representação em um lugar só.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Girus — Plataforma de Gestão Comercial",
    // As telas internas passam só o próprio nome; a marca entra aqui.
    template: "%s | Girus",
  },
  description,
  // A rota que serve o JSON (src/app/manifest.webmanifest/route.ts) — sem esta
  // linha o navegador não oferece "instalar aplicativo".
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    // iOS ignora o manifesto para o ícone da tela inicial e usa só esta tag.
    // Sem ela, o atalho salvo no iPhone sai com um print da página.
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Girus",
    // "default" mantém a barra de status legível sobre o fundo claro do app;
    // "black-translucent" faria o conteúdo passar por baixo dela.
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Girus",
    url: "/",
    title: "Girus — Plataforma de Gestão Comercial",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Girus — Plataforma de Gestão Comercial",
    description,
  },
};

/**
 * `themeColor` pinta a barra do navegador no Android e a moldura do app
 * instalado — é o que faz a janela parecer parte do produto em vez de uma aba.
 * Vive em `viewport` e não em `metadata`: o App Router move estas chaves para
 * cá e avisa no build quando ficam no objeto errado.
 *
 * `maximumScale` fica FORA de propósito. Travar o zoom é a receita de bolo do
 * app mobile, e aqui o público é idoso: quem precisa aproximar para ler um
 * preço tem de conseguir.
 */
export const viewport: Viewport = {
  themeColor: "#c97f0a",
  width: "device-width",
  initialScale: 1,
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
        {/* Apollo e toasts NÃO entram aqui: cada grupo de rotas que fala com o
            backend monta o `AppProviders` no próprio layout. O layout raiz é
            compartilhado com a landing pública, que é estática e não deve pagar
            o cliente do Apollo na primeira pintura. */}
        <Suspense fallback={null}>{children}</Suspense>
        {/* Web Vitals reais dos usuários e contagem de visitas/páginas. Os dois
            saem por /_vercel/* (mesma origem), então a CSP de produção já os
            cobre em `script-src 'self'` e `connect-src 'self'`. Só coletam
            quando servido pela Vercel — em dev e no E2E ficam inertes. */}
        <SpeedInsights />
        <Analytics />
        {/* Registra o service worker depois do `load`, só em produção. */}
        <ServiceWorker />
      </body>
    </html>
  );
}
