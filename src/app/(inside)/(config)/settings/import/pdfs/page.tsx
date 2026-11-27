import { redirect } from "next/navigation";

import OrderPdfBatchesContent from "./content";
import { requirePdfImportPage } from "./guard";

interface PageProps {
  searchParams: Promise<{ batch?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  await requirePdfImportPage();

  // Endereço antigo (`?batch=`), de quando lista e assistente eram uma tela só.
  const { batch } = await searchParams;
  if (batch) redirect(`/settings/import/pdfs/${batch}`);

  return <OrderPdfBatchesContent />;
};

export default Page;
