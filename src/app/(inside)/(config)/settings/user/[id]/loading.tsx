import { UserProfileSkeleton } from "../../../_shared/userProfile";

// Sem breadcrumb: no próprio perfil o rastro teria um passo único (é o que o
// `UserProfileHeader` faz com `isSelf`).
export default function Loading() {
  return <UserProfileSkeleton />;
}
