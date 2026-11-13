import { gqlFetch } from "@/services/graphql/gqlFetch";
import PlatformEmailsContent from "./content";
import { PLATFORM_EMAIL_LOG_QUERY } from "./gql";
import { EmailLogQueryData } from "./interface";

/**
 * Histórico de envio — aberto ao suporte (o guard do layout basta): é a tela
 * que responde "o cliente diz que não recebeu o email".
 */
const Page = async () => {
  let seed: EmailLogQueryData | null = null;
  try {
    const { data } = await gqlFetch<EmailLogQueryData>({
      query: PLATFORM_EMAIL_LOG_QUERY,
      variables: { email: null, limit: 50 },
    });
    seed = data?.platformEmailLog?.data ? data : null;
  } catch {
    seed = null;
  }

  return <PlatformEmailsContent seed={seed} />;
};

export default Page;
