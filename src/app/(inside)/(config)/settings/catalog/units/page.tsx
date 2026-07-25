import { requireAdminPage } from "@/utils/auth/roleGuard";
import UnitsContent from "./content";

const Page = async () => {
  await requireAdminPage("/profile");

  return <UnitsContent />;
};

export default Page;
