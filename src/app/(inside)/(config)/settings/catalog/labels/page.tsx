import { requireAdminPage } from "@/utils/auth/roleGuard";
import LabelsContent from "./content";

const Page = async () => {
  await requireAdminPage("/profile");

  return <LabelsContent />;
};

export default Page;
