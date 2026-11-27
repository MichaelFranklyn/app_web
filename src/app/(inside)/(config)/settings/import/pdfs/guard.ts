import { getCompanySetupSteps } from "@/services/companySetup/server";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import { redirect } from "next/navigation";

import { blockingStep } from "../utils";

/**
 * A trava das três telas dos PDFs (lista, lote novo e lote aberto): só admin, e
 * a mesma do histórico pela planilha, porque os PDFs viram os mesmos pedidos.
 */
export async function requirePdfImportPage() {
  await requireAdminPage("/profile");
  const steps = await getCompanySetupSteps();
  if (steps) {
    const index = steps.findIndex((s) => s.key === "ORDER_HISTORY");
    if (index >= 0 && blockingStep(steps, index)) redirect("/settings/import");
  }
}
