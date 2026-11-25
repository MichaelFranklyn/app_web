import { PageContent } from "@/components/PageContent";
import { ImportHeader } from "./_components/ImportHeader";
import { SetupSkeleton } from "./_components/SetupSkeleton";

/**
 * A página confere o papel no servidor antes de renderizar; sem este limite o
 * menu das configurações aparecia ao lado de um vazio até ela responder.
 */
export default function ImportLoading() {
  return (
    <PageContent>
      <ImportHeader />
      <SetupSkeleton />
    </PageContent>
  );
}
