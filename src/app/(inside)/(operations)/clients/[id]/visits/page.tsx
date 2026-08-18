import { requireFeaturePage } from "@/services/plan/server";

import VisitsContent from "./content";

/**
 * Aba do motor de rotina: quem chega pela URL sem o recurso no plano volta para
 * a visão geral DESTE cliente — a aba já não aparece na navegação, e devolver a
 * pessoa ao dashboard a tiraria do cliente que ela estava abrindo.
 */
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await requireFeaturePage("ROUTINES", `/clients/${id}/overview`);
  return <VisitsContent />;
};

export default Page;
