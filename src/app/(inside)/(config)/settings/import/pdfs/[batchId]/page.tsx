import { PdfImportWizard } from "../_components/PdfImportWizard";
import { requirePdfImportPage } from "../guard";

interface PageProps {
  params: Promise<{ batchId: string }>;
}

const Page = async ({ params }: PageProps) => {
  await requirePdfImportPage();
  const { batchId } = await params;
  return <PdfImportWizard initialBatchId={batchId} />;
};

export default Page;
