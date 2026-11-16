import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * Endereço antigo: "repor" virou parte de "Fazer pedido" (`/pedido`). Fica o
 * redirecionamento para links salvos e mensagens já enviadas.
 */
export default async function PortalLegacyReporPage({ params }: PageProps) {
  const { token } = await params;
  redirect(`/p/${token}/pedido`);
}
