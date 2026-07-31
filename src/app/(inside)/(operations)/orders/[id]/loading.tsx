import { OrderDetailSkeleton } from "./_components/OrderDetailSkeleton";

// Sem um limite próprio, quem abre um pedido veria o skeleton da LISTA (o
// `loading.tsx` de `/orders`, o limite mais próximo) antes do detalhe.
export default function Loading() {
  return <OrderDetailSkeleton />;
}
