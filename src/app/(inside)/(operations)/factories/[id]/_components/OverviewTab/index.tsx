"use client";

import { CompanyFactoryDetail } from "../../interface";
import { CommercialCard } from "./CommercialCard";
import { ContractCard } from "./ContractCard";

interface Props {
  companyFactory: CompanyFactoryDetail;
}

export function OverviewTab({ companyFactory }: Props) {
  return (
    <div className="flex flex-col gap-16">
      <CommercialCard companyFactory={companyFactory} />
      <ContractCard companyFactory={companyFactory} />
    </div>
  );
}
