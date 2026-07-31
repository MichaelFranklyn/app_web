import { UserProfileSkeleton } from "../../../_shared/userProfile";

// Mesmo esqueleto que o `content.tsx` usa enquanto o perfil carrega. Sem um
// limite próprio, abrir uma pessoa mostraria o skeleton da LISTA de pessoas (o
// `loading.tsx` de `/settings/users`, o limite mais próximo).
export default function Loading() {
  return <UserProfileSkeleton hasBreadcrumb />;
}
