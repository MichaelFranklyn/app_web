import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ seller?: string }>;
};

/**
 * O dia é a visão de dia da Agenda (desde 19/10/2026). Esta rota era uma tela
 * à parte — a "rota do dia" — que buscava a agenda por outro caminho e mostrava
 * outra pessoa e outras paradas. Fica só para os links antigos e os favoritos.
 */
const Page = async ({ params, searchParams }: Props) => {
  const { date } = await params;
  const { seller } = await searchParams;
  const query = new URLSearchParams({ view: "day", date });
  if (seller) query.set("seller", seller);
  redirect(`/agenda?${query.toString()}`);
};

export default Page;
