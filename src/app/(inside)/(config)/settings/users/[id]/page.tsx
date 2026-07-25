import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { isAdminRole } from "@/utils/auth/roles";
import { redirect } from "next/navigation";
import UserProfileContent from "./content";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Perfil de OUTRA pessoa — é coisa de gestão. O próprio perfil tem a sua tela
 * nas configurações (/settings/user/[id]), com os mesmos cards e as mutations
 * do dono; quem cai aqui com o próprio id é levado para lá.
 */
const Page = async ({ params }: Props) => {
  const { id } = await params;

  const payload = await getDecodedTokenServer();
  if (payload?.sub === id) redirect(`/settings/user/${id}`);
  if (!isAdminRole(payload?.role)) {
    redirect(payload?.sub ? `/settings/user/${payload.sub}` : "/dashboard");
  }

  return <UserProfileContent userId={id} />;
};

export default Page;
