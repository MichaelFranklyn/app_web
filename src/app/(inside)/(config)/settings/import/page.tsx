import { requireAdminPage } from "@/utils/auth/roleGuard";
import ImportSettingsContent from "./content";

const Page = async () => {
  // Trazer a base de outro sistema mexe na carteira inteira: é gestão.
  await requireAdminPage("/profile");
  return <ImportSettingsContent />;
};

export default Page;
