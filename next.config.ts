import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Recomendado true para identificar problemas no ciclo de vida do React
  reactStrictMode: true,

  // Segurança: Remove o cabeçalho "X-Powered-By: Next.js"
  poweredByHeader: false,

  // Segurança: Não gera mapas de fonte em produção (ninguém vê seu código original no DevTools)
  productionBrowserSourceMaps: false,

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
        ],
      },
    ];
  },

};

export default nextConfig;
