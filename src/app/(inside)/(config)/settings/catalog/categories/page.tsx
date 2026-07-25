import { requireAdminPage } from "@/utils/auth/roleGuard";
import CategoriesContent from "./content";

const Page = async () => {
  // Catálogos da empresa são gestão — vendedor não passa daqui.
  await requireAdminPage("/profile");

  return <CategoriesContent />;
};

export default Page;
