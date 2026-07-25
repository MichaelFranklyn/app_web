"use client";

import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { CompanyAddressCard } from "./_components/CompanyAddressCard";
import { CompanyBrandCard } from "./_components/CompanyBrandCard";
import { CompanyContactCard } from "./_components/CompanyContactCard";
import { CompanyHeader } from "./_components/CompanyHeader";
import { CompanyIdentityCard } from "./_components/CompanyIdentityCard";
import { EditBrandModal } from "./_components/EditBrandModal";
import { EditCompanyModal } from "./_components/EditCompanyModal";

import { MY_COMPANY_QUERY } from "./gql";
import { MyCompanyQueryData } from "./interface";
import {
  ADDRESS_FORM_STEPS,
  buildAddressInitialData,
  buildContactInitialData,
  CONTACT_FORM_STEPS,
  IDENTITY_FORM_STEPS,
  normalizeAddress,
  normalizeContact,
  normalizeIdentity,
} from "./utils";

/** Qual assunto está aberto para edição — um modal por vez. */
type EditTarget = "identity" | "contact" | "address" | "brand" | null;

export default function CompanyContent() {
  const { data, loading, error, refetch } =
    useQuery<MyCompanyQueryData>(MY_COMPANY_QUERY);
  const [editing, setEditing] = useState<EditTarget>(null);

  const company = data?.my_company?.data ?? null;
  const onSaved = () => refetch();
  const close = () => setEditing(null);

  if (loading && !company) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[420px]" />
      </PageContent>
    );
  }

  if (error || !company) {
    return (
      <PageContent>
        <QueryError
          onRetry={() => refetch()}
          retrying={loading}
          title="Não foi possível carregar os dados da empresa"
        />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <CompanyHeader company={company} />

      {/* Mesma forma do perfil da pessoa: os dados em leitura, um card por
          assunto, e o botão âmbar do cabeçalho abre o modal daquele assunto. Antes
          eram quatro formulários abertos e quatro botões "Salvar" — quem só queria
          trocar o telefone rolava a tela inteira sem saber o que cada um gravava. */}
      <div className="flex flex-col gap-24">
        <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
          <CompanyIdentityCard
            company={company}
            onEdit={() => setEditing("identity")}
          />
          <CompanyContactCard
            company={company}
            onEdit={() => setEditing("contact")}
          />
          <CompanyAddressCard
            company={company}
            onEdit={() => setEditing("address")}
          />
          <CompanyBrandCard
            company={company}
            onEdit={() => setEditing("brand")}
          />
        </Grid.Root>
      </div>

      <EditCompanyModal
        company={company}
        open={editing === "identity"}
        onOpenChange={close}
        onSaved={onSaved}
        title="Editar segmento"
        description="O que a sua empresa vende. Razão social, CNPJ e nome fantasia vêm da Receita Federal."
        steps={IDENTITY_FORM_STEPS}
        initialData={{ segment: company.segment }}
        normalize={normalizeIdentity}
        size="sm"
      />

      <EditCompanyModal
        company={company}
        open={editing === "contact"}
        onOpenChange={close}
        onSaved={onSaved}
        title="Editar contato"
        description="Como o cliente fala com a sua empresa. Sai no PDF do pedido."
        steps={CONTACT_FORM_STEPS}
        initialData={buildContactInitialData(company)}
        normalize={normalizeContact}
        size="sm"
      />

      <EditCompanyModal
        company={company}
        open={editing === "address"}
        onOpenChange={close}
        onSaved={onSaved}
        title="Editar endereço"
        description="Digite o CEP e o resto vem preenchido."
        steps={ADDRESS_FORM_STEPS}
        initialData={buildAddressInitialData(company)}
        normalize={normalizeAddress}
        size="lg"
      />

      <EditBrandModal
        company={company}
        open={editing === "brand"}
        onOpenChange={close}
        onSaved={onSaved}
      />
    </PageContent>
  );
}
