import { ToastProvider } from "@/components/Toast/Provider";
import { GraphqlProvider } from "@/services/graphql/provider";
import type { Metadata } from "next";
import { Suspense } from "react";
import "../styles/globals.css";

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
    <html lang="pt-br">
      <body suppressHydrationWarning className={`antialiased`}>
        <GraphqlProvider>
          <ToastProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </ToastProvider>
        </GraphqlProvider>
      </body>
    </html>
  );
}
