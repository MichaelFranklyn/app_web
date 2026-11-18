import { getCompanySetupSteps } from "@/services/companySetup/server";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import { redirect } from "next/navigation";

import { blockingStep } from "../utils";
import OrderHistoryImportContent from "./content";

const Page = async () => {
  await requireAdminPage("/profile");

  // O card do histórico fica travado até os passos obrigatórios anteriores
  // estarem feitos; quem chega pelo endereço volta para a lista de passos.
  const steps = await getCompanySetupSteps();
  if (steps) {
    const index = steps.findIndex((s) => s.key === "ORDER_HISTORY");
    if (index >= 0 && blockingStep(steps, index)) redirect("/settings/import");
  }

  return <OrderHistoryImportContent />;
};

export default Page;
