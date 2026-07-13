import type { NextConfig } from "next";

// Origem do backend GraphQL (para o connect-src). Pós-BFF o client é same-origin,
// mas mantemos aqui como rede de segurança (belt-and-suspenders).
const backendOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_GRAPHQL_API_HOST || "").origin;
  } catch {
    return "";
  }
})();

// Content-Security-Policy pragmática (aplicada, não report-only). 'unsafe-inline'
// nos scripts/estilos é o compromisso do App Router (scripts de hidratação inline
// sem nonce + estilos inline do Tailwind); a real proteção do token contra XSS
// vem do cookie httpOnly (BFF). Aplicada só em produção — o `next dev` usa
// eval/websocket do HMR do Turbopack e não deve sofrer fricção (o E2E roda em
// build de produção, então continua exercitando a CSP).
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://storage.googleapis.com https://drivops-public.s3.us-east-1.amazonaws.com https://drivops-public.s3.amazonaws.com https://maps.gstatic.com https://maps.googleapis.com`,
  `font-src 'self' data:`,
  `connect-src 'self'${backendOrigin ? ` ${backendOrigin}` : ""} https://maps.googleapis.com https://viacep.com.br`,
  `frame-src https://www.google.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join("; ");

const nextConfig: NextConfig = {
  // Permite que os testes E2E façam build/start em um diretório isolado
  // (.next-e2e), sem colidir com o .next do `next dev` em uso.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Recomendado true para identificar problemas no ciclo de vida do React
  reactStrictMode: true,

  // Performance: importa apenas os ícones/funções usados desses pacotes de
  // barril, cortando o custo de parse/bundle de importar o índice inteiro.
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },

  // Segurança: Remove o cabeçalho "X-Powered-By: Next.js"
  poweredByHeader: false,

  // Segurança: Não gera mapas de fonte em produção (ninguém vê seu código original no DevTools).
  // Exceção: builds de cobertura E2E (COVERAGE=1) precisam dos source maps para
  // mapear a cobertura V8 do browser de volta para src/**.
  productionBrowserSourceMaps: !!process.env.COVERAGE,

  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drivops-public.s3.us-east-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drivops-public.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload", // Força HTTPS por 2 anos
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN", // Bloqueia seu site de ser aberto em iframes (anti-clickjacking)
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Impede o navegador de tentar adivinhar tipos de arquivo
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // Bloqueia acesso a hardware se não for usado (ajuste conforme necessidade)
          },
          // CSP só em produção (evita fricção com o HMR do Turbopack em dev).
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: csp }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
