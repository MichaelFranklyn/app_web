import { requireAdminPage } from "@/utils/auth/roleGuard";
import OrderHistoryImportContent from "./content";

const Page = async () => {
  await requireAdminPage("/profile");
  return <OrderHistoryImportContent />;
};

export default Page;
