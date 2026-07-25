import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { redirect } from "next/navigation";

const Page = async () => {
  // "Meu perfil" mora em /settings/user/<sub do token>; manter /profile como
  // atalho evita reescrever os links da topbar, do hub e dos tours.
  const payload = await getDecodedTokenServer();
  redirect(payload?.sub ? `/settings/user/${payload.sub}` : "/dashboard");
};

export default Page;
