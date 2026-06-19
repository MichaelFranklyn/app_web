"use client";

import { ImportTemplateTab } from "../_components/ImportTemplateTab";
import { useFactoryDetail } from "../context";

export default function FactoryImportTemplatePage() {
  const { companyFactory } = useFactoryDetail();
  return <ImportTemplateTab factoryId={companyFactory.factory.id} />;
}
