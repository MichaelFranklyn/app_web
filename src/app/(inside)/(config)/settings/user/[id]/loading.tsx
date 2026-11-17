import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { isAdminRole } from "@/utils/auth/roles";
import { UserProfileSkeleton } from "../../../_shared/userProfile";

// Owner/admin veem o rastro "Pessoas › nome" no próprio perfil (têm a lista de
// Pessoas); o vendedor não. O esqueleto reserva o mesmo espaço para não pular.
export default async function Loading() {
  const payload = await getDecodedTokenServer();
  return <UserProfileSkeleton hasBreadcrumb={isAdminRole(payload?.role)} />;
}
