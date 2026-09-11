"use client";

import { ContactsTab } from "../_components/ContactsTab";
import { useFactoryDetail } from "../context";

export default function FactoryContactsPage() {
  const { companyFactory } = useFactoryDetail();

  return <ContactsTab factoryId={companyFactory.factory.id} />;
}
