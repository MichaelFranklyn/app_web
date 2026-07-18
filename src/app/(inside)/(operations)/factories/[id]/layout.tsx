import { requireAdminPage } from "@/utils/auth/roleGuard";
import { ReactNode, Suspense } from "react";
import { FactoryDetailContent } from "./_components/FactoryDetailContent";
import { FactoryDetailSkeleton } from "./_components/FactoryDetailSkeleton";

export default async function FactoryDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  // O detalhe da fábrica é só para gestão — vendedor é redirecionado para a
  // lista antes de qualquer query SSR @is_admin (que voltaria "Acesso negado").
  await requireAdminPage("/factories");

  const { id } = await params;

  return (
    <Suspense fallback={<FactoryDetailSkeleton />}>
      <FactoryDetailContent id={id}>{children}</FactoryDetailContent>
    </Suspense>
  );
}
