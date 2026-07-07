"use client";

import { PaymentTermsTab } from "../_components/PaymentTermsTab";
import { useFactoryDetail } from "../context";

export default function FactoryPaymentTermsPage() {
  const { companyFactory } = useFactoryDetail();
  return <PaymentTermsTab companyFactoryId={companyFactory.id} />;
}
