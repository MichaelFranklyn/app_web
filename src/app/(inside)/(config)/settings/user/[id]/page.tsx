import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { isAdminRole } from "@/utils/auth/roles";
import { redirect } from "next/navigation";
import MyProfileContent from "./content";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * "Meu perfil" mora nas configurações: é aqui que a pessoa mexe nos próprios
 * dados. O perfil de OUTRA pessoa é coisa de gestão e continua em /settings/users/[id] —
 * mesma grade de cards, mas com as mutations do gestor.
 */
const Page = async ({ params }: Props) => {
  const { id } = await params;

  const payload = await getDecodedTokenServer();
  if (!payload?.sub) redirect("/dashboard");

  if (payload.sub !== id) {
    // Gestor que chegou aqui com o id de outra pessoa quis ver o perfil dela.
    redirect(
      isAdminRole(payload.role)
        ? `/settings/users/${id}`
        : `/settings/user/${payload.sub}`
    );
  }

  // `createSeller` é mutation de gestor: só owner/admin pode habilitar o próprio
  // perfil de vendedor (o proprietário que também vende).
  return (
    <MyProfileContent userId={id} canEnableSeller={isAdminRole(payload.role)} />
  );
};

export default Page;
