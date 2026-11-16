import { CaseSkeleton } from "./_components/CaseSkeleton";

// Sem este limite a rota herdava o `loading.tsx` de /support — o skeleton da
// LISTA aparecia ao abrir uma reclamação (14/11/2026).
export default function SupportCaseLoading() {
  return <CaseSkeleton />;
}
