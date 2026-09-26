import { LinkExpired } from "@/components/LinkExpired";
import { PublicPage } from "@/components/PublicPage";
import { Title } from "@/components/Title";
import { visitResponseFetch } from "@/services/graphql/visitResponseFetch";
import { formatDate } from "@/utils/format/date";
import { VisitResponseContent } from "./content";
import { VISIT_RESPONSE_FORM } from "./gql";
import { VisitResponseFormData } from "./interface";
import { formPeriodLabel } from "./utils";

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * Título próprio: o layout do grupo `(portal)` chama tudo de "Suas compras", e
 * esta página não é do cliente. O `robots: noindex` do layout continua valendo
 * — aqui o endereço também É a credencial.
 */
export const metadata = { title: "Respostas da rota" };

/**
 * Formulário de resposta da rota de um dia (ou da semana), aberto por link.
 *
 * O cabeçalho traz a empresa e o nome do vendedor por uma razão prática: um
 * link recebido no WhatsApp, sem nada que o identifique, é indistinguível de
 * golpe — e este pede para a pessoa digitar o que aconteceu no dia de trabalho
 * dela.
 */
export default async function VisitResponsePage({ params }: PageProps) {
  const { token } = await params;

  const data = await visitResponseFetch<VisitResponseFormData>(
    VISIT_RESPONSE_FORM,
    token
  );
  const form = data?.visitResponseForm?.data ?? null;

  if (!form) {
    return (
      <LinkExpired>
        Peça um link novo ao escritório — ele sai junto com a folha da rota do
        dia.
      </LinkExpired>
    );
  }

  return (
    <PublicPage.Root>
      <PublicPage.Header className="gap-[2px]">
        <Title variant="heading-sm">{form.companyName}</Title>
        <Title variant="body-xs" color="muted">
          {form.sellerName} ·{" "}
          {form.isWeek ? formPeriodLabel(form) : formatDate(form.date)}
        </Title>
        {form.submittedAt ? (
          <Title variant="body-xs" color="muted">
            Você já enviou respostas{" "}
            {form.isWeek ? "desta semana" : "deste dia"}. Pode ajustar e enviar
            de novo.
          </Title>
        ) : null}
      </PublicPage.Header>

      <PublicPage.Main>
        <VisitResponseContent form={form} token={token} />
      </PublicPage.Main>
    </PublicPage.Root>
  );
}
