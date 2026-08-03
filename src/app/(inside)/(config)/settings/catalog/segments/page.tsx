import { requireAdminPage } from "@/utils/auth/roleGuard";
import SegmentsContent from "./content";

const Page = async () => {
  // Catálogos da empresa são gestão — vendedor não passa daqui.
  await requireAdminPage("/profile");

  return <SegmentsContent />;
};

export default Page;
