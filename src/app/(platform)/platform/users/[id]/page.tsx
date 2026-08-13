import { gqlFetch } from "@/services/graphql/gqlFetch";
import { DocumentNode } from "graphql";
import { notFound } from "next/navigation";
import UserDetailContent from "./content";
import { PLATFORM_USER_QUERY, USER_ACTIVITY_QUERY } from "./gql";
import { UserActivityQueryData, UserQueryData } from "./interface";
import { activityVariables } from "./utils";

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchSeed<T>(
  query: DocumentNode,
  variables: Record<string, unknown>
): Promise<T | null> {
  try {
    const { data } = await gqlFetch<T>({ query, variables });
    return data;
  } catch {
    return null;
  }
}

const Page = async ({ params }: Props) => {
  const { id } = await params;

  const [user, activity] = await Promise.all([
    fetchSeed<UserQueryData>(PLATFORM_USER_QUERY, { id }),
    fetchSeed<UserActivityQueryData>(
      USER_ACTIVITY_QUERY,
      activityVariables(id)
    ),
  ]);

  // Pessoa inexistente é 404 de verdade, não uma ficha vazia. `null` cobre
  // tanto falha de rede quanto não-encontrado; só o segundo é distinguível
  // aqui — a query volta com `data: null`.
  if (user && !user.platformUser?.data) notFound();

  return (
    <UserDetailContent
      id={id}
      seedUser={user?.platformUser?.data ? user : null}
      seedActivity={activity?.user_activity?.edges?.length ? activity : null}
    />
  );
};

export default Page;
