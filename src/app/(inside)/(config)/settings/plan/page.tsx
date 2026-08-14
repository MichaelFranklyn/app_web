import { requireOwnerPage } from "@/utils/auth/roleGuard";
import PlanContent from "./content";

const Page = async () => {
  // O contrato é assunto de quem responde por ele. O vendedor não abre — para
  // ele, o efeito do plano é o menu já não mostrar o que a empresa não tem.
  await requireOwnerPage("/profile");

  return <PlanContent />;
};

export default Page;
