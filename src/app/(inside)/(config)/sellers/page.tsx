import { redirect } from "next/navigation";

const Page = async () => {
  // Vendedor e usuário são a mesma coisa (a diferença é ter perfil de campo),
  // então existe UMA lista de pessoas: /users. Mantemos a rota como atalho para
  // não quebrar links antigos.
  redirect("/settings/users");
};

export default Page;
