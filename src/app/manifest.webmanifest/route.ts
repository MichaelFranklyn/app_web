import { NextResponse } from "next/server";

/**
 * O manifesto do PWA, servido como rota em vez de arquivo em `public/`.
 *
 * Por que rota: o `start_url` precisa ser o que o app abre DEPOIS de instalado,
 * e isso muda por ambiente (localhost em desenvolvimento, o domínio na Vercel).
 * Um JSON estático fixaria uma origem só, e a instalação em preview abriria
 * produção. Aqui o caminho é relativo e o navegador resolve contra a origem de
 * onde baixou o manifesto — o mesmo motivo pelo qual `getSiteUrl()` existe.
 *
 * `display: "standalone"` é o ponto do trabalho: instalado na tela inicial, o
 * app abre sem barra de endereço nem abas. Quem trabalha dentro da loja abre um
 * ícone, não um navegador.
 *
 * `start_url: "/dashboard"`, e não "/": a raiz é a landing de marketing, que
 * não tem nada a dizer a quem já instalou o app. Quem não estiver logado é
 * levado ao login pelo middleware de sessão, que é o comportamento certo.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      name: "Girus — Gestão Comercial",
      // Até 12 caracteres: é o que o Android mostra sob o ícone. Mais que isso
      // é truncado com reticências no meio do nome.
      short_name: "Girus",
      description:
        "Pedidos, carteira de clientes, comissões e a rota do dia do vendedor.",
      start_url: "/dashboard",
      // `scope` na raiz para o portal do cliente (/p/[token]) e o login também
      // abrirem dentro do app instalado, em vez de pularem para o navegador.
      scope: "/",
      display: "standalone",
      orientation: "portrait-primary",
      lang: "pt-BR",
      dir: "ltr",
      // As mesmas cores do tema (--bg e --amber em globals.css). `background_color`
      // é o que pinta a tela de abertura antes do CSS carregar: deixá-la branca
      // daria um flash claro em cima do fundo bege do app.
      background_color: "#f5f4f0",
      theme_color: "#c97f0a",
      categories: ["business", "productivity"],
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        // Separado do "any" de propósito: o Android recorta o ícone em
        // círculo/squircle e só garante os 80% centrais. O arquivo maskable tem
        // fundo opaco e margem para as pontas da seta não serem cortadas.
        {
          src: "/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      // Atalhos do menu de contexto do ícone (segurar o ícone no Android).
      // Só rotas que EXISTEM: o wizard de criar pedido é modal dentro de
      // /orders e não tem URL própria, então "novo pedido" daria 404 — atalho
      // quebrado no menu do sistema é pior que atalho ausente.
      shortcuts: [
        {
          name: "Rota do dia",
          short_name: "Rota",
          description: "As visitas de hoje",
          url: "/routines",
        },
        {
          name: "Pedidos",
          short_name: "Pedidos",
          description: "Lista de pedidos",
          url: "/orders",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        // Uma hora: o manifesto muda raramente, mas um cache eterno deixaria o
        // ícone antigo preso no dispositivo de quem já instalou.
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
