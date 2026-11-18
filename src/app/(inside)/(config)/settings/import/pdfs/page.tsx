import { getCompanySetupSteps } from "@/services/companySetup/server";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import { redirect } from "next/navigation";

import { blockingStep } from "../utils";
import OrderPdfImportContent from "./content";

interface PageProps {
  searchParams: Promise<{ batch?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  await requireAdminPage("/profile");

  // Mesma trava do histórico pela planilha: os PDFs viram os mesmos pedidos.
  const steps = await getCompanySetupSteps();
  if (steps) {
    const index = steps.findIndex((s) => s.key === "ORDER_HISTORY");
    if (index >= 0 && blockingStep(steps, index)) redirect("/settings/import");
  }

  const { batch } = await searchParams;
  return <OrderPdfImportContent initialBatchId={batch ?? null} />;
};

export default Page;
