import { requireAdminPage } from "@/utils/auth/roleGuard";
import CatalogSettingsContent from "./content";

const Page = async () => {
  // Catálogos da empresa são gestão — vendedor só tem a config de rotina.
  await requireAdminPage("/settings/routine");

  return <CatalogSettingsContent />;
};

export default Page;
