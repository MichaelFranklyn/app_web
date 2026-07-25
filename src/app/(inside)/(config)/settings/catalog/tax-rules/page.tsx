import { requireAdminPage } from "@/utils/auth/roleGuard";
import TaxRulesContent from "./content";

const Page = async () => {
  await requireAdminPage("/profile");

  return <TaxRulesContent />;
};

export default Page;
