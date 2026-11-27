import { PdfImportWizard } from "../_components/PdfImportWizard";
import { requirePdfImportPage } from "../guard";

const Page = async () => {
  await requirePdfImportPage();
  return <PdfImportWizard initialBatchId={null} />;
};

export default Page;
