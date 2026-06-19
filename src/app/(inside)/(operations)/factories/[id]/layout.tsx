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
  const { id } = await params;

  return (
    <Suspense fallback={<FactoryDetailSkeleton />}>
      <FactoryDetailContent id={id}>{children}</FactoryDetailContent>
    </Suspense>
  );
}
