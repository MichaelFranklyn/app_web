import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

// Atalho para o perfil no novo caminho (/settings/users/[id]) — o link antigo
// circulava em tours e prompts de "complete o cadastro".
const Page = async ({ params }: Props) => {
  const { id } = await params;
  redirect(`/settings/users/${id}`);
};

export default Page;
